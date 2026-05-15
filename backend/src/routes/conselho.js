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
// POST: INICIAR CONSELHO
// POST -> /api/conselho/iniciar
// body:{ tipoConselho, idTurma, idUsuario, conselhoId?, semestre?, ano? }
//   - sem conselhoId  -> tenta reaproveitar conselho do MESMO ciclo (tipo+semestre+ano+usuário).
//                        Se existir (mesmo finalizado), retorna o id existente
//                        e reabre como "Em andamento". Senão cria um novo.
//   - com conselhoId  -> apenas vincula a turma ao conselho existente
// ==========================================
router.post('/iniciar', async (req, res) => {
  try {
    const { tipoConselho, idTurma, idUsuario, conselhoId } = req.body;
    let { semestre, ano } = req.body;

    if (!idTurma ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Id Turma é obrigatório'
      });
    }

    let conselhoIdFinal = conselhoId;

    if (!conselhoIdFinal) {
      if (!tipoConselho || !idUsuario) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'tipoConselho e idUsuario são obrigatórios para criar um novo conselho'
        });
    }

     if (!semestre || !ano) {
        const ciclo = cicloAtual();
        semestre = semestre || ciclo.semestre;
        ano = ano || ciclo.ano;
      }

      // 1. Procurar conselho existente no mesmo ciclo (mesmo tipo, semestre, ano e usuário)
      const existente = await db`
        SELECT "idConselho", "status"
          FROM "Conselho"
         WHERE "tipoConselho" = ${tipoConselho}
           AND "semestre"     = ${semestre}
           AND "ano"          = ${ano}
           AND "Usuario_idUsuario" = ${idUsuario}
         ORDER BY "idConselho" DESC
         LIMIT 1`;

      if (existente.length > 0) {
        conselhoIdFinal = existente[0].idConselho;
        // Se estava finalizado, reabre para permitir editar/avaliar aluno esquecido
        if (existente[0].status === 'Finalizado') {
          await db`
            UPDATE "Conselho"
               SET "status" = ${'Em andamento'}
             WHERE "idConselho" = ${conselhoIdFinal}
          `;
        }
      } else {
        // 2. Inserir Conselho novo no ciclo informado
        const novoConselho = await db`
          INSERT INTO "Conselho"
            ("tipoConselho", "dataRealizacao", "status", "semestre", "ano", "Usuario_idUsuario")
          VALUES
            (${tipoConselho}, NOW(), ${'Iniciado'}, ${semestre}, ${ano}, ${idUsuario})
          RETURNING "idConselho"
        `;
        conselhoIdFinal = novoConselho[0].idConselho;
      }
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
      mensagem: conselhoId ? 'Turma adicionada ao conselho' : 'Conselho iniciado com sucesso'
    });

  } catch (erro) {
    console.error('ERRO INICIAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao iniciar conselho' });

  }
});

// ==========================================
// GET: BUSCAR CONSELHO ATIVO DO CICLO ATUAL
// GET -> /api/conselho/ativo/:tipoConselho/:idUsuario?semestre=1&ano=2026
// Retorna o conselho do tipo informado do ciclo atual (ou do ciclo informado)
// para o usuário. Útil para retomar conselho ao reabrir a página.
// ==========================================
router.get('/ativo/:tipoConselho/:idUsuario', async (req, res) => {
  try {
    const { tipoConselho, idUsuario } = req.params;
    let { semestre, ano } = req.query;

    if (!semestre || !ano) {
      const ciclo = cicloAtual();
      semestre = semestre || ciclo.semestre;
      ano = ano || ciclo.ano;
    }

    const result = await db`
      SELECT "idConselho", "status", "semestre", "ano"
        FROM "Conselho"
       WHERE "tipoConselho" = ${tipoConselho}
         AND "semestre"     = ${semestre}
         AND "ano"          = ${ano}
         AND "Usuario_idUsuario" = ${idUsuario}
       ORDER BY "idConselho" DESC
       LIMIT 1
    `;

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
      organizacao,
      comportamental,
      assiduidade,
      disponibilidade_Aprendizado,
      observacao,
      alcancou_Objetivos, 
      acaoProposta
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
      result = await db`
        UPDATE "Avaliacao_Turma"
         SET "organizacao" = ${organizacao},
            "comportamental" = ${comportamental},
            "assiduidade" = ${assiduidade},
            "disponibilidade_Aprendizado" = ${disponibilidade_Aprendizado},
            "observacao" = ${observacao},
            "acaoProposta" = ${acaoProposta},
            "alcancou_Objetivos" = ${alcancou_Objetivos}
        WHERE "Conselho_idConselho" = ${conselhoId} AND "Turma_idTurma" = ${idTurma}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Turma"
          ("Conselho_idConselho", "Turma_idTurma", "organizacao", "comportamental",
           "assiduidade", "disponibilidade_Aprendizado", "observacao",
           "acaoProposta", "alcancou_Objetivos")
        VALUES
           (${conselhoId}, ${idTurma}, ${organizacao}, ${comportamental},
           ${assiduidade}, ${disponibilidade_Aprendizado}, ${observacao},
           ${acaoProposta}, ${alcancou_Objetivos})
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
// POST: SALVAR AVALIAÇÃO DE ALUNO
// POST -> /api/conselho/avaliacao-aluno
// ==========================================
router.post('/avaliacao-aluno', async (req, res) => {
  try {
    const {
      conselhoId,
      idAluno,
      naturezaOcorrencia,
      restricao,
      acaoProposta,
      acaoPropostaIntermediario,
      acaoPropostaPreConselho,
      responsavel,
      responsavelIntermediario,
      responsavelPreConselho,
      justificativa,
      informacoesComplementares,
      situacaoFinal,
      contestacaoSituacaoFinal,
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
            "acaoPropostaIntermediario" = ${acaoPropostaIntermediario},
            "acaoPropostaPreConselho"   = ${acaoPropostaPreConselho},
            "responsavel"               = ${responsavel},
            "responsavelIntermediario"  = ${responsavelIntermediario},
            "responsavelPreConselho"    = ${responsavelPreConselho},
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
           "acaoProposta", "acaoPropostaIntermediario", "acaoPropostaPreConselho",
           "responsavel", "responsavelIntermediario", "responsavelPreConselho",
           "justificativa", "informacoesComplementares",
           "situacaoFinal", "contestacaoSituacaoFinal",
           "Usuario_idUsuario", "tblAluno_idtblAluno")
        VALUES
          (${conselhoId}, ${naturezaOcorrencia}, ${restricao},
           ${acaoProposta}, ${acaoPropostaIntermediario}, ${acaoPropostaPreConselho},
           ${responsavel}, ${responsavelIntermediario}, ${responsavelPreConselho},
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

module.exports = router;
