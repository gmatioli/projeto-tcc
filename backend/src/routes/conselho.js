const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getSemestreAtual } = require('../utils/semestre');

// ==========================================
// POST: INICIAR CONSELHO
// POST -> /api/conselho/iniciar
// body: { tipoConselho, idTurma, idUsuario }
//   - Reusa conselho existente do mesmo tipo + semestre + ano vinculado à turma.
//   - Se não existe, cria novo carimbado com semestre/ano atuais.
// ==========================================
router.post('/iniciar', async (req, res) => {
  try {
    const { tipoConselho, idTurma, idUsuario } = req.body;

    if (!idTurma) {
      return res.status(400).json({ sucesso: false, mensagem: 'Id Turma é obrigatório' });
    }
    if (!tipoConselho || !idUsuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'tipoConselho e idUsuario são obrigatórios'
      });
    }

    const { semestre, ano } = getSemestreAtual();

    const existente = await db`
      SELECT c."idConselho", c."status"
      FROM "Conselho" c
      INNER JOIN "Turma_has_Conselho" thc ON thc."Conselho_idConselho" = c."idConselho"
      WHERE thc."Turma_idTurma" = ${idTurma}
        AND c."tipoConselho" = ${tipoConselho}
        AND c."semestre" = ${semestre}
        AND c."ano" = ${ano}
      LIMIT 1
    `;

    if (existente.length > 0) {
      return res.json({
        sucesso: true,
        conselhoId: existente[0].idConselho,
        semestre,
        ano,
        status: existente[0].status,
        mensagem: 'Conselho do semestre atual reaberto'
      });
    }

    const novo = await db`
      INSERT INTO "Conselho"
        ("tipoConselho", "dataRealizacao", "status", "semestre", "ano", "Usuario_idUsuario")
      VALUES
        (${tipoConselho}, NOW(), ${'Em andamento'}, ${semestre}, ${ano}, ${idUsuario})
      RETURNING "idConselho"
    `;

    const conselhoIdFinal = novo[0].idConselho;

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
      semestre,
      ano,
      status: 'Em andamento',
      mensagem: 'Conselho iniciado com sucesso'
    });
  } catch (erro) {
    console.error('ERRO INICIAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao iniciar conselho' });
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

    const conselho = await db`
      SELECT "semestre", "ano" FROM "Conselho" WHERE "idConselho" = ${conselhoId}
    `;
    if (conselho.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });
    }

    const { semestre, ano } = getSemestreAtual();
    if (conselho[0].semestre !== semestre || conselho[0].ano !== ano) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Conselho de semestre anterior — operação bloqueada.'
      });
    }

    await db`
      UPDATE "Conselho"
      SET "status" = ${'Finalizado'}
      WHERE "idConselho" = ${conselhoId}
    `;

    return res.json({ sucesso: true, mensagem: 'Conselho finalizado com sucesso' });
  } catch (erro) {
    console.error('ERRO FINALIZAR CONSELHO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao finalizar conselho' });
  }
});

// ==========================================
// GET: INTERMEDIÁRIO DO SEMESTRE ATUAL DE UMA TURMA
// GET -> /api/conselho/turma/:idTurma/intermediario-semestre-atual
// Usada pelo Pré-Conselho para herdar a tag "Restrito" do Intermediário corrente.
// ==========================================
router.get('/turma/:idTurma/intermediario-semestre-atual', async (req, res) => {
  try {
    const { idTurma } = req.params;
    const { semestre, ano } = getSemestreAtual();

    const conselho = await db`
      SELECT c."idConselho", c."status"
      FROM "Conselho" c
      INNER JOIN "Turma_has_Conselho" thc ON thc."Conselho_idConselho" = c."idConselho"
      WHERE thc."Turma_idTurma" = ${idTurma}
        AND c."tipoConselho" = 'Intermediário'
        AND c."semestre" = ${semestre}
        AND c."ano" = ${ano}
      LIMIT 1
    `;

    if (conselho.length === 0) {
      return res.json({
        sucesso: true,
        conselhoIntermediarioId: null,
        statusIntermediario: null,
        semestre,
        ano,
        avaliacoes: []
      });
    }

    const result = await db`
      SELECT
        aa."idAvaliacao_Aluno",
        aa."Conselho_idConselho",
        aa."tblAluno_idtblAluno",
        aa."naturezaOcorrencia",
        aa."restricao",
        aa."justificativa",
        aa."informacoesComplementares",
        aa."situacaoFinal",
        aa."contestacaoSituacaoFinal",
        aa."acaoPropostaIntermediario" AS "acaoProposta",
        aa."responsavelIntermediario"  AS "responsavel",
        a."nome"
      FROM "Avaliacao_Aluno" aa
      INNER JOIN "tblAluno" a ON a."idtblAluno" = aa."tblAluno_idtblAluno"
      WHERE aa."Conselho_idConselho" = ${conselho[0].idConselho}
        AND a."Turma_idTurma" = ${idTurma}
    `;

    return res.json({
      sucesso: true,
      conselhoIntermediarioId: conselho[0].idConselho,
      statusIntermediario: conselho[0].status,
      semestre,
      ano,
      avaliacoes: result
    });
  } catch (erro) {
    console.error('ERRO BUSCAR INTERMEDIÁRIO DO SEMESTRE:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar intermediário do semestre' });
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
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });
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
      SELECT
        aa."idAvaliacao_Aluno",
        aa."Conselho_idConselho",
        aa."tblAluno_idtblAluno",
        aa."naturezaOcorrencia",
        aa."restricao",
        aa."justificativa",
        aa."informacoesComplementares",
        aa."situacaoFinal",
        aa."contestacaoSituacaoFinal",
        aa."Usuario_idUsuario",
        COALESCE(aa."acaoPropostaIntermediario", aa."acaoPropostaPreConselho", aa."acaoProposta") AS "acaoProposta",
        COALESCE(aa."responsavelIntermediario", aa."responsavelPreConselho") AS "responsavel",
        a."nome"
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

    return res.json({ sucesso: true, avaliacao: result[0] || null });
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
      return res.status(400).json({ sucesso: false, mensagem: 'conselhoId e idTurma são obrigatórios' });
    }

    const conselho = await db`
      SELECT "semestre", "ano" FROM "Conselho" WHERE "idConselho" = ${conselhoId}
    `;
    if (conselho.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });
    }
    const { semestre, ano } = getSemestreAtual();
    if (conselho[0].semestre !== semestre || conselho[0].ano !== ano) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Conselho de semestre anterior — operação bloqueada.'
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

    return res.json({ sucesso: true, avaliacao: result[0] });
  } catch (erro) {
    console.error('ERRO SALVAR AVALIAÇÃO TURMA:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar avaliação de turma' });
  }
});

// ==========================================
// POST: SALVAR AVALIAÇÃO DE ALUNO
// POST -> /api/conselho/avaliacao-aluno
// Roteia acaoProposta/responsavel pra coluna específica do tipoConselho.
// ==========================================
router.post('/avaliacao-aluno', async (req, res) => {
  try {
    const {
      conselhoId,
      idAluno,
      naturezaOcorrencia,
      restricao,
      acaoProposta,
      justificativa,
      informacoesComplementares,
      situacaoFinal,
      responsavel,
      contestacaoSituacaoFinal,
      idUsuario
    } = req.body;

    if (!conselhoId || !idAluno || !idUsuario) {
      return res.status(400).json({ sucesso: false, mensagem: 'Dados obrigatórios faltando' });
    }

    const conselho = await db`
      SELECT "tipoConselho", "semestre", "ano"
      FROM "Conselho" WHERE "idConselho" = ${conselhoId}
    `;
    if (conselho.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });
    }
    const { semestre, ano } = getSemestreAtual();
    if (conselho[0].semestre !== semestre || conselho[0].ano !== ano) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Conselho de semestre anterior — operação bloqueada.'
      });
    }

    const isIntermediario = conselho[0].tipoConselho === 'Intermediário';
    const isPre = conselho[0].tipoConselho === 'Pré-Conselho';

    const acaoIntermediario = isIntermediario ? (acaoProposta ?? null) : null;
    const acaoPre = isPre ? (acaoProposta ?? null) : null;
    const respIntermediario = isIntermediario ? (responsavel ?? null) : null;
    const respPre = isPre ? (responsavel ?? null) : null;

    const existente = await db`
      SELECT "idAvaliacao_Aluno" FROM "Avaliacao_Aluno"
      WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
    `;

    let result;
    if (existente.length > 0) {
      result = await db`
        UPDATE "Avaliacao_Aluno"
        SET "naturezaOcorrencia" = ${naturezaOcorrencia ?? null},
            "restricao" = ${restricao ?? null},
            "acaoPropostaIntermediario" = ${acaoIntermediario},
            "acaoPropostaPreConselho" = ${acaoPre},
            "responsavelIntermediario" = ${respIntermediario},
            "responsavelPreConselho" = ${respPre},
            "justificativa" = ${justificativa ?? null},
            "informacoesComplementares" = ${informacoesComplementares ?? null},
            "situacaoFinal" = ${situacaoFinal ?? null},
            "contestacaoSituacaoFinal" = ${contestacaoSituacaoFinal ?? null}
        WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Aluno"
          ("Conselho_idConselho", "naturezaOcorrencia", "restricao",
           "acaoPropostaIntermediario", "acaoPropostaPreConselho",
           "responsavelIntermediario", "responsavelPreConselho",
           "justificativa", "informacoesComplementares", "situacaoFinal",
           "contestacaoSituacaoFinal", "Usuario_idUsuario", "tblAluno_idtblAluno")
        VALUES
          (${conselhoId}, ${naturezaOcorrencia ?? null}, ${restricao ?? null},
           ${acaoIntermediario}, ${acaoPre},
           ${respIntermediario}, ${respPre},
           ${justificativa ?? null}, ${informacoesComplementares ?? null}, ${situacaoFinal ?? null},
           ${contestacaoSituacaoFinal ?? null}, ${idUsuario}, ${idAluno})
        RETURNING *
      `;
    }

    return res.json({ sucesso: true, avaliacao: result[0] });
  } catch (erro) {
    console.error('ERRO SALVAR AVALIAÇÃO ALUNO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar avaliação de aluno' });
  }
});

// ==========================================
// DELETE: REMOVER AVALIAÇÃO DE ALUNO (engano)
// DELETE -> /api/conselho/avaliacao-aluno
// body: { conselhoId, idAluno }
// Remove apenas a avaliação daquele aluno naquele conselho.
// ==========================================
router.delete('/avaliacao-aluno', async (req, res) => {
  try {
    const { conselhoId, idAluno } = req.body;

    if (!conselhoId || !idAluno) {
      return res.status(400).json({ sucesso: false, mensagem: 'Dados obrigatórios faltando' });
    }

    const conselho = await db`
      SELECT "semestre", "ano" FROM "Conselho" WHERE "idConselho" = ${conselhoId}
    `;
    if (conselho.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conselho não encontrado' });
    }
    const { semestre, ano } = getSemestreAtual();
    if (conselho[0].semestre !== semestre || conselho[0].ano !== ano) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Conselho de semestre anterior — operação bloqueada.'
      });
    }

    await db`
      DELETE FROM "Avaliacao_Aluno"
      WHERE "Conselho_idConselho" = ${conselhoId}
        AND "tblAluno_idtblAluno" = ${idAluno}
    `;

    return res.json({ sucesso: true, mensagem: 'Avaliação removida' });
  } catch (erro) {
    console.error('ERRO REMOVER AVALIAÇÃO ALUNO:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover avaliação' });
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

module.exports = router;
