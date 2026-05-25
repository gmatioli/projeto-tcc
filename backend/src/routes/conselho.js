const express = require('express');
const router = express.Router();
const db = require('../config/db');


// Calcula semestre/ano corrente quando o cliente não informa
// (mês <= 6 => 1º semestre, senão 2º)
function cicloAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semestre = hoje.getMonth() + 1 <= 6 ? 1 : 2;
  return { ano, semestre };
}

// ==========================================
// POST: INICIAR/ LOCALIZAR CONSELHO + VINCULAR TURMA
// POST -> /api/conselho/iniciar
// body: { tipoConselho, idTurma, idUsuario, semestre?, ano? }
// Lookup em duas etapas, antes de criar um novo:
//   1) Conselho do ciclo já vinculado a esta TURMA (qualquer dono).
//      Permite que o usuário B "encontre" o conselho criado pelo A
//      ao abrir uma turma que A já trabalhou.
//   2) Sessão ativa do usuário no mesmo ciclo (sem turma ainda).
//      Permite que A continue na mesma sessão ao navegar para outra
//      turma dele que ainda não foi vinculada.
//   3) Nenhum encontrado -> cria um novo Conselho com o usuário logado
//      como dono. O dono fica registrado apenas para auditoria.
//
// Em qualquer caminho, a turma é inserida em Turma_has_Conselho de
// forma idempotente (ON CONFLICT DO NOTHING).
// ==========================================
router.post('/iniciar', async (req, res) => {
  try {
    
    const { tipoConselho, idTurma, idUsuario } = req.body;
    let { semestre, ano } = req.body;

    if (!idTurma) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Id Turma é obrigatório'
      });
    }
  
    if (!tipoConselho || !idUsuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'tipoConselho e idUsuario são obrigatórios'
      });
    }

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

     // Etapa 1: existe conselho do ciclo vinculado a essa turma?
    let existente = await db`
      SELECT c."idConselho", c."status", c."Usuario_idUsuario", u."nomeUsuario"
        FROM "Conselho" c
        INNER JOIN "Turma_has_Conselho" thc ON thc."Conselho_idConselho" = c."idConselho"
        LEFT JOIN "Usuario" u ON u."idUsuario" = c."Usuario_idUsuario"
       WHERE c."tipoConselho"    = ${tipoConselho}
         AND c."semestre"        = ${semestre}
         AND c."ano"             = ${ano}
         AND thc."Turma_idTurma" = ${idTurma}
       ORDER BY c."idConselho" DESC
       LIMIT 1
    `;

     // Etapa 2: fallback pela sessão ativa do próprio usuário no ciclo.
    if (existente.length === 0) {
      existente = await db`
        SELECT c."idConselho", c."status", c."Usuario_idUsuario", u."nomeUsuario"
          FROM "Conselho" c
          LEFT JOIN "Usuario" u ON u."idUsuario" = c."Usuario_idUsuario"
         WHERE c."tipoConselho"      = ${tipoConselho}
           AND c."semestre"          = ${semestre}
           AND c."ano"               = ${ano}
           AND c."Usuario_idUsuario" = ${idUsuario}
         ORDER BY c."idConselho" DESC
         LIMIT 1
      `;
    }
    let conselhoIdFinal;
    let donoInfo = null;

    if (existente.length > 0) {
      conselhoIdFinal = existente[0].idConselho;
      donoInfo = {
        idUsuario: existente[0].Usuario_idUsuario,
        nomeUsuario: existente[0].nomeUsuario,
        };
      // Se estava finalizado, reabre para permitir editar/avaliar aluno esquecido
      if (existente[0].status === 'Finalizado') {
        await db`
          UPDATE "Conselho"
              SET "status" = ${'Em andamento'}
            WHERE "idConselho" = ${conselhoIdFinal}
        `;
      }
    } else {
      // Etapa 3: cria novo conselho (o idUsuario informado vira o dono).
      const novoConselho = await db`
        INSERT INTO "Conselho"
          ("tipoConselho", "dataRealizacao", "status", "semestre", "ano", "Usuario_idUsuario")
        VALUES
          (${tipoConselho}, NOW(), ${'Iniciado'}, ${semestre}, ${ano}, ${idUsuario})
        RETURNING "idConselho"
      `;
      conselhoIdFinal = novoConselho[0].idConselho;
      const dono = await db`
        SELECT "idUsuario", "nomeUsuario" FROM "Usuario" WHERE "idUsuario" = ${idUsuario}
      `;
      donoInfo = dono[0] || null;
    }

    await db`
      INSERT INTO "Turma_has_Conselho"
        ("Conselho_idConselho", "Turma_idTurma")
      VALUES
       (${conselhoIdFinal}, ${idTurma})
      ON CONFLICT ("Turma_idTurma", "Conselho_idConselho") DO NOTHING
    `;

    return res.json({
      sucesso: true,
      conselhoId: conselhoIdFinal,
      dono: donoInfo, mensagem: existente.length > 0 ? 'Conselho localizado' : 'Conselho iniciado com sucesso'
    });

  } catch (erro) {
    console.error('ERRO INICIAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao iniciar conselho' });

  }
});

// ==========================================
// GET: BUSCAR CONSELHO ATIVO PARA UMA TURMA NO CICLO
// GET -> /api/conselho/ativo/:tipoConselho/turma/:idTurma?idUsuario=X&semestre=1&ano=2026
//
// Read-only. Faz o mesmo lookup em duas etapas do POST /iniciar,
// mas só considera conselhos NÃO finalizados ('Iniciado' ou 'Em andamento'):
//   1) Conselho do ciclo vinculado a essa turma (qualquer dono).
//   2) Sessão ativa do usuário no ciclo (se idUsuario for informado).
//
// Retorna { conselho: { idConselho, status, Usuario_idUsuario, nomeUsuario, ... } | null }
// para o frontend decidir se mostra "Iniciar" ou "Editar Conselho" e
// para exibir o aviso "Iniciado por <nome>" quando o logado não é o dono.
// ==========================================
router.get('/ativo/:tipoConselho/turma/:idTurma', async (req, res) => {
  try {
    const { tipoConselho, idTurma } = req.params;
    const { idUsuario } = req.query;
    let { semestre, ano } = req.query;

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

   // Etapa 1: por turma (cross-user)
    let result = await db`
      SELECT c."idConselho", c."status", c."semestre", c."ano",
             c."Usuario_idUsuario", u."nomeUsuario"
        FROM "Conselho" c
        INNER JOIN "Turma_has_Conselho" thc ON thc."Conselho_idConselho" = c."idConselho"
        LEFT JOIN "Usuario" u ON u."idUsuario" = c."Usuario_idUsuario"
       WHERE c."tipoConselho"    = ${tipoConselho}
         AND c."semestre"        = ${Number(semestre)}
         AND c."ano"             = ${Number(ano)}
         AND thc."Turma_idTurma" = ${idTurma}
       ORDER BY c."idConselho" DESC
       LIMIT 1
    `;

    // Etapa 2: sessão ativa do usuário no ciclo (turma ainda não vinculada).
    if (result.length === 0 && idUsuario) {
      result = await db`
        SELECT c."idConselho", c."status", c."semestre", c."ano",
               c."Usuario_idUsuario", u."nomeUsuario"
          FROM "Conselho" c
          LEFT JOIN "Usuario" u ON u."idUsuario" = c."Usuario_idUsuario"
         WHERE c."tipoConselho"      = ${tipoConselho}
           AND c."semestre"          = ${Number(semestre)}
           AND c."ano"               = ${Number(ano)}
           AND c."Usuario_idUsuario" = ${idUsuario}
         ORDER BY c."idConselho" DESC
         LIMIT 1
      `;
    }

    return res.json({
      sucesso: true,
      conselho: result[0] || null,
      ciclo: { semestre: Number(semestre), ano: Number(ano) }
    });
  } catch (erro) {
    console.error('ERRO BUSCAR CONSELHO ATIVO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conselho ativo' });
  }
});

// ==========================================
// POST: FINALIZAR CONSELHO
// POST -> /api/conselho/finalizar
// ==========================================
router.post('/finalizar', async (req, res) => {
  try {
    const { conselhoId } = req.body;

    if (!conselhoId) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do conselho é obrigatório' });
    }

    const result = await db`
      UPDATE "Conselho"
      SET "status" = ${'Finalizado'}
      WHERE "idConselho" = ${conselhoId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });

    }

    return res.json({
      sucesso: true,
      mensagem: 'Conselho finalizado com sucesso',
      conselho: result[0]
    });

  } catch (erro) {
    console.error('ERRO FINALIZAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao finalizar conselho' });

  }
});

// ==========================================
// GET: BUSCAR DADOS DO CONSELHO
// GET -> /api/conselho/:conselhoId
// ==========================================
router.get('/:conselhoId', async (req, res) => {
  try {
    const { conselhoId } = req.params;

    const resultConselho = await db`
      SELECT * FROM "Conselho" WHERE "idConselho" = ${conselhoId}
    `;

    if (resultConselho.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Conselho não encontrado'
      });
    }

    const resultTurmas = await db`
      SELECT t.* FROM "Turma" t
      INNER JOIN "Turma_has_Conselho" thc ON t."idTurma" = thc."Turma_idTurma"
      WHERE thc."Conselho_idConselho" = ${conselhoId}
    `;

    const resultAvaliacoesTurma = await db`
      SELECT * FROM "Avaliacao_Turma" WHERE "Conselho_idConselho" = ${conselhoId}
    `;

    const resultAvaliacoesAlunos = await db`
      SELECT aa.*, a."nome"
      FROM "Avaliacao_Aluno" aa
      INNER JOIN "tblAluno" a ON aa."tblAluno_idtblAluno" = a."idtblAluno"
      WHERE aa."Conselho_idConselho" = ${conselhoId}
    `;

    return res.json({
      sucesso: true,
      conselho: {
        ...resultConselho[0],
        turmas: resultTurmas,
        avaliacoesTurma: resultAvaliacoesTurma,
        avaliacoesAlunos: resultAvaliacoesAlunos
      }
    });

  } catch (erro) {
    console.error('ERRO BUSCAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conselho' });

  }
});


// ==========================================
// GET: AVALIACAO DE UMA TURMA EM UM CONSELHO
// GET -> /api/conselho/:conselhoId/avaliacao-turma/:idTurma
// ==========================================
router.get('/:conselhoId/avaliacao-turma/:idTurma', async (req, res) => {
  try {
    const { conselhoId, idTurma } = req.params;

    const result = await db`
      SELECT * FROM "Avaliacao_Turma"
      WHERE "Conselho_idConselho" = ${conselhoId} AND "Turma_idTurma" = ${idTurma}
    `;

    return res.json({
      sucesso: true,
      avaliacao: result[0] || null
    });

  } catch (erro) {
    console.error('ERRO BUSCAR AVALIACAO TURMA:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar avaliação de turma' });
  }
});

// ==========================================
// POST: SALVAR AVALIAÇÃO DE TURMA
// POST -> /api/conselho/avaliacao-turma
// body: { conselhoId, idTurma, organizacao, comportamental, assiduidade,
//         disponibilidade_Aprendizado, observacao, acaoProposta, alcancou_Objetivos }
// ==========================================
router.post('/avaliacao-turma', async (req, res) => {
  try {
    const {
      conselhoId,
      idTurma,
      idUsuario,
      organizacao = null,
      comportamental = null,
      assiduidade = null,
      disponibilidade_Aprendizado = null,
      observacao = null,
      alcancou_Objetivos = null,
      acaoPreventiva = null
    } = req.body;

    if (!conselhoId || !idTurma) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'conselhoId e idTurma são obrigatórios'
      });
    }

    const existente = await db`
      SELECT "idAvaliacao_Turma" FROM "Avaliacao_Turma"
      WHERE "Conselho_idConselho" = ${conselhoId} AND "Turma_idTurma" = ${idTurma}
    `;

    let result;
    if (existente.length > 0) {
      // Atualiza o Usuario_idUsuario para registrar quem foi o último editor.
      result = await db`
        UPDATE "Avaliacao_Turma"
         SET "organizacao" = ${organizacao},
            "comportamental" = ${comportamental},
            "assiduidade" = ${assiduidade},
            "disponibilidade_Aprendizado" = ${disponibilidade_Aprendizado},
            "observacao" = ${observacao},
            "acaoPreventiva" = ${acaoPreventiva},
            "alcancou_Objetivos" = ${alcancou_Objetivos},
            "Usuario_idUsuario" = ${idUsuario || null}
        WHERE "Conselho_idConselho" = ${conselhoId} AND "Turma_idTurma" = ${idTurma}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Turma"
          ("Conselho_idConselho", "Turma_idTurma", "organizacao", "comportamental",
           "assiduidade", "disponibilidade_Aprendizado", "observacao",
           "acaoPreventiva", "alcancou_Objetivos", "Usuario_idUsuario")
        VALUES
           (${conselhoId}, ${idTurma}, ${organizacao}, ${comportamental},
           ${assiduidade}, ${disponibilidade_Aprendizado}, ${observacao},
           ${acaoPreventiva}, ${alcancou_Objetivos}, ${idUsuario || null})
        RETURNING *
      `;
    }

    return res.json({
      sucesso: true,
      mensagem: existente.length > 0 ? 'Avaliação da turma atualizada' : 'Avaliação da turma criada',
      avaliacao: result[0]
    });


  } catch (erro) {
    console.error('ERRO SALVAR AVALIAÇÃO TURMA:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao salvar avaliação de turma'
    });
  }
});


// ==========================================
// DELETE: REMOVER AVALIAÇÃO DE ALUNO (RESTRIÇÃO) - USADO PARA "DESRESTRINGIR" ALUNO
// DELETE -> /api/conselho/avaliacao-aluno/:conselhoId/:idAluno
// ========================================== 
router.delete('/avaliacao-aluno/:conselhoId/:idAluno', async (req, res) => {
  const { conselhoId, idAluno } = req.params;

  if (!conselhoId || !idAluno) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'conselhoId e idAluno são obrigatórios'
    });
  }

  try {
    const deletado = await db`
      DELETE FROM "Avaliacao_Aluno"
      WHERE "Conselho_idConselho" = ${conselhoId}
        AND "tblAluno_idtblAluno" = ${idAluno}
      RETURNING *
    `;

    if (deletado.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Nenhuma avaliação encontrada para esse aluno neste conselho'
      });
    }

    return res.json({
      sucesso: true,
      mensagem: 'Restrição removida com sucesso',
      avaliacaoRemovida: deletado[0]
    });
  } catch (err) {
    console.error('ERRO REMOVER AVALIACAO ALUNO:', err);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao remover avaliação do aluno'
    });
  }
});

// ==========================================
// POST: SALVAR AVALIAÇÃO DE ALUNO
// POST -> /api/conselho/avaliacao-aluno
// ==========================================
router.post('/avaliacao-aluno', async (req, res) => {
  try {
    const {
      conselhoId,
      idAluno,
      naturezaOcorrencia = null,
      restricao = null,
      acaoProposta = null,
      responsavel = null,
      justificativa = null,
      informacoesComplementares = null,
      situacaoFinal = null,
      contestacaoSituacaoFinal = null,
      idUsuario
    } = req.body;

    if (!conselhoId || !idAluno || !idUsuario) {
      return res.status(400).json({ sucesso: false, mensagem: 'Dados obrigatórios faltando' });
    }

    const existente = await db`
      SELECT "idAvaliacao_Aluno" FROM "Avaliacao_Aluno"
      WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
    `;

    let result;

    if (existente.length > 0) {
      result = await db`
        UPDATE "Avaliacao_Aluno"
         SET "naturezaOcorrencia"        = ${naturezaOcorrencia},
            "restricao"                 = ${restricao},
            "acaoProposta"              = ${acaoProposta},
            "responsavel"               = ${responsavel},
            "justificativa"             = ${justificativa},
            "informacoesComplementares" = ${informacoesComplementares},
            "situacaoFinal"             = ${situacaoFinal},
            "contestacaoSituacaoFinal"  = ${contestacaoSituacaoFinal}
        WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Aluno"
          ("Conselho_idConselho", "naturezaOcorrencia", "restricao",
           "acaoProposta", "responsavel", 
           "justificativa", "informacoesComplementares",
           "situacaoFinal", "contestacaoSituacaoFinal",
           "Usuario_idUsuario", "tblAluno_idtblAluno")
        VALUES
          (${conselhoId}, ${naturezaOcorrencia}, ${restricao},
           ${acaoProposta}, ${responsavel}, 
           ${justificativa}, ${informacoesComplementares},
           ${situacaoFinal}, ${contestacaoSituacaoFinal},
           ${idUsuario}, ${idAluno})
        RETURNING *
      `;
    }

    return res.json({
      sucesso: true,
      mensagem: existente.length > 0 ? 'Avaliação do aluno atualizada' : 'Avaliação do aluno criada',
      avaliacao: result[0]
    });

  } catch (erro) {
    console.error('ERRO SALVAR AVALIAÇÃO ALUNO:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao salvar avaliação de aluno'
    });
  }
});

// ==========================================
// GET: AVALIAÇÕES DE ALUNOS DE UMA TURMA EM UM CONSELHO
// GET -> /api/conselho/:conselhoId/turma/:idTurma/avaliacoes-alunos
// Filtra Avaliacao_Aluno por conselho E por turma (via JOIN com tblAluno).
// Resolve o bug dos cards: só retorna alunos da turma renderizada.
// ==========================================
router.get('/:conselhoId/turma/:idTurma/avaliacoes-alunos', async (req, res) => {
  try {
    const { conselhoId, idTurma } = req.params;

    const result = await db`
      SELECT aa.*, a."nome"
      FROM "Avaliacao_Aluno" aa
      INNER JOIN "tblAluno" a ON a."idtblAluno" = aa."tblAluno_idtblAluno"
      WHERE aa."Conselho_idConselho" = ${conselhoId}
        AND a."Turma_idTurma" = ${idTurma}
    `;

    return res.json({ sucesso: true, avaliacoes: result });
  } catch (erro) {
    console.error('ERRO BUSCAR AVALIACOES ALUNOS POR TURMA:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar avaliações de alunos' });
  }
});


// ==========================================
// GET: HISTÓRICO DO INTERMEDIÁRIO PARA O CICLO INFORMADO
// GET -> /api/conselho/historico-intermediario/turma/:idTurma?semestre=1&ano=2026
// Retorna as Avaliacao_Aluno feitas no Conselho Intermediário do mesmo ciclo,
// para todos os alunos da turma. Usado pelo Pré-Conselho para mostrar quem
// já estava "Restrito" no Intermediário e trazer os dados como base.
// ==========================================
router.get('/historico-intermediario/turma/:idTurma', async (req, res) => {
  try {
    const { idTurma } = req.params;
    let { semestre, ano } = req.query;

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

    const result = await db`
      SELECT aa.*, a."nome", c."semestre", c."ano", c."tipoConselho"
        FROM "Avaliacao_Aluno" aa
        INNER JOIN "tblAluno" a ON a."idtblAluno" = aa."tblAluno_idtblAluno"
        INNER JOIN "Conselho" c ON c."idConselho" = aa."Conselho_idConselho"
       WHERE a."Turma_idTurma"  = ${idTurma}
         AND c."tipoConselho"   = 'Intermediário'
         AND c."semestre"       = ${semestre}
         AND c."ano"            = ${ano}
    `;

    return res.json({ sucesso: true, avaliacoes: result });
  } catch (erro) {
    console.error('ERRO BUSCAR HISTÓRICO INTERMEDIÁRIO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar histórico do intermediário' });
  }
});


// ==========================================
// GET: DADOS DO PRÉ-CONSELHO PARA O CONSELHO FINAL
// GET -> /api/conselho/dados-pre-conselho/turma/:idTurma?semestre=1&ano=2026
// Retorna dois grupos de alunos da turma com base nas avaliações do Pré-Conselho:
//   - alunosComAcaoProposta: alunos com acaoPropostaPreConselho preenchida (tabela principal)
//   - alunosComJustificativa: alunos com justificativa preenchida (tabela lateral)
// ==========================================
router.get('/dados-pre-conselho/turma/:idTurma', async (req, res) => {
  try {
    const { idTurma } = req.params;
    let { semestre, ano } = req.query;

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

    const result = await db`
      SELECT
        a."idtblAluno",
        a."nome",
        a."matricula",
        aa."acaoProposta",
        aa."justificativa", 
        aa."situacaoFinal",
        aa."contestacaoSituacaoFinal"
      FROM "tblAluno" a
      INNER JOIN "Avaliacao_Aluno" aa ON aa."tblAluno_idtblAluno" = a."idtblAluno"
      INNER JOIN "Conselho" c ON c."idConselho" = aa."Conselho_idConselho"
      WHERE a."Turma_idTurma" = ${idTurma}
        AND c."tipoConselho"  = 'Pré-Conselho'
        AND c."semestre"      = ${semestre}
        AND c."ano"           = ${ano}
      ORDER BY a."nome" ASC
    `;

    const alunosComAcaoProposta = result.filter(
      a => a.acaoProposta && a.acaoProposta.trim() !== ''
    );

    const alunosComJustificativa = result.filter(
      a => a.justificativa && a.justificativa.trim() !== ''
    );

    return res.json({ sucesso: true, alunosComAcaoProposta, alunosComJustificativa });
  } catch (erro) {
    console.error('ERRO BUSCAR DADOS PRÉ-CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar dados do pré-conselho' });
  }
});
// ==========================================
// PATCH: SALVAR SITUAÇÃO FINAL DO ALUNO (CONSELHO FINAL)
// PATCH -> /api/conselho/situacao-final
// ==========================================
router.patch('/situacao-final', async (req, res) => {
  try {
    const { idAluno, idUsuario, situacaoFinal, contestacaoSituacaoFinal } = req.body;
    let { semestre, ano } = req.body;

    if (!idAluno || !idUsuario || !situacaoFinal) {
      return res.status(400).json({ sucesso: false, mensagem: 'idAluno, idUsuario e situacaoFinal são obrigatórios' });
    }

    const valoresValidos = ['Aprovado', 'Aprovado pelo conselho', 'Reprovado'];
    if (!valoresValidos.includes(situacaoFinal)) {
      return res.status(400).json({ sucesso: false, mensagem: 'situacaoFinal inválido' });
    }

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

    // Busca o conselho Final do ciclo; cria se não existir
    let conselhoFinal = await db`
      SELECT "idConselho" FROM "Conselho"
      WHERE "tipoConselho"       = 'Final'
        AND "semestre"           = ${semestre}
        AND "ano"                = ${ano}
        AND "Usuario_idUsuario"  = ${idUsuario}
      ORDER BY "idConselho" DESC
      LIMIT 1
    `;

    let conselhoId;
    if (conselhoFinal.length > 0) {
      conselhoId = conselhoFinal[0].idConselho;
    } else {
      const novo = await db`
        INSERT INTO "Conselho"
          ("tipoConselho", "dataRealizacao", "status", "semestre", "ano", "Usuario_idUsuario")
        VALUES
          ('Final', NOW(), 'Em andamento', ${semestre}, ${ano}, ${idUsuario})
        RETURNING "idConselho"
      `;
      conselhoId = novo[0].idConselho;
    }

    // Upsert: insere se não existe, atualiza se já existe
    const result = await db`
      INSERT INTO "Avaliacao_Aluno"
        ("Conselho_idConselho", "tblAluno_idtblAluno", "Usuario_idUsuario",
         "situacaoFinal", "contestacaoSituacaoFinal")
      VALUES
        (${conselhoId}, ${idAluno}, ${idUsuario},
         ${situacaoFinal}, ${contestacaoSituacaoFinal || null})
      ON CONFLICT ("tblAluno_idtblAluno", "Conselho_idConselho")
      DO UPDATE SET
        "situacaoFinal"            = EXCLUDED."situacaoFinal",
        "contestacaoSituacaoFinal" = EXCLUDED."contestacaoSituacaoFinal"
      RETURNING *
    `;

    return res.json({ sucesso: true, mensagem: 'Situação final salva com sucesso', avaliacao: result[0] });
  } catch (erro) {
    console.error('ERRO SALVAR SITUAÇÃO FINAL:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar situação final' });
  }
});

module.exports = router;
