const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// POST: INICIAR CONSELHO
// POST -> /api/conselho/iniciar
// ==========================================
router.post('/iniciar', async (req, res) => {
  try {
    const { tipoConselho, idTurma, idUsuario } = req.body;

    if (!tipoConselho || !idTurma || !idUsuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios faltando'
      });
    }

    // 1. Criar registro em Conselho
    const resultConselho = await db`
      INSERT INTO "Conselho"
        ("tipoConselho", "dataInicio", "status", "Usuario_idUsuario")
      VALUES
        (${tipoConselho}, NOW(), ${'Em Progresso'}, ${idUsuario})
      RETURNING "idConselho"
    `;

    const conselhoId = resultConselho[0].idConselho;

    // 2. Inserir relação Conselho_Turma
    await db`
      INSERT INTO "Conselho_Turma"
        ("Conselho_idConselho", "Turma_idTurma", "dataAdicao")
      VALUES
        (${conselhoId}, ${idTurma}, NOW())
    `;

    return res.json({
      sucesso: true,
      conselhoId: conselhoId,
      mensagem: 'Conselho iniciado com sucesso'
    });

  } catch (erro) {
    console.error('ERRO INICIAR CONSELHO:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao iniciar conselho'
    });
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
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do conselho é obrigatório'
      });
    }

    const result = await db`
      UPDATE "Conselho"
      SET "status" = ${'Finalizado'}, "dataFinalizacao" = NOW()
      WHERE "idConselho" = ${conselhoId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Conselho não encontrado'
      });
    }

    return res.json({
      sucesso: true,
      mensagem: 'Conselho finalizado com sucesso',
      conselho: result[0]
    });

  } catch (erro) {
    console.error('ERRO FINALIZAR CONSELHO:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao finalizar conselho'
    });
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
      INNER JOIN "Conselho_Turma" ct ON t."idTurma" = ct."Turma_idTurma"
      WHERE ct."Conselho_idConselho" = ${conselhoId}
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
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar conselho'
    });
  }
});

// ==========================================
// POST: SALVAR AVALIAÇÃO DE TURMA
// POST -> /api/conselho/avaliacao-turma
// ==========================================
router.post('/avaliacao-turma', async (req, res) => {
  try {
    const {
      conselhoId,
      organizacao,
      comportamental,
      assiduidade,
      disponibilidade_Aprendizado,
      observacao,
      alcancou_Objetivos
    } = req.body;

    if (!conselhoId) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do conselho é obrigatório'
      });
    }

    const existente = await db`
      SELECT "idAvaliacao_Turma" FROM "Avaliacao_Turma"
      WHERE "Conselho_idConselho" = ${conselhoId}
    `;

    let result;
    if (existente.length > 0) {
      result = await db`
        UPDATE "Avaliacao_Turma"
        SET "organizacao" = ${organizacao}, "comportamental" = ${comportamental},
            "assiduidade" = ${assiduidade},
            "disponibilidade_Aprendizado" = ${disponibilidade_Aprendizado},
            "observacao" = ${observacao},
            "alcancou_Objetivos" = ${alcancou_Objetivos}
        WHERE "Conselho_idConselho" = ${conselhoId}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Turma"
          ("Conselho_idConselho", "organizacao", "comportamental", "assiduidade",
           "disponibilidade_Aprendizado", "observacao", "alcancou_Objetivos")
        VALUES
          (${conselhoId}, ${organizacao}, ${comportamental}, ${assiduidade},
           ${disponibilidade_Aprendizado}, ${observacao}, ${alcancou_Objetivos})
        RETURNING *
      `;
    }

    return res.json({
      sucesso: true,
      mensagem: 'Avaliação de turma salva com sucesso',
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
      justificativa,
      informacoesComplementares,
      situacaoFinal,
      idUsuario
    } = req.body;

    if (!conselhoId || !idAluno || !idUsuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios faltando'
      });
    }

    const existente = await db`
      SELECT "idAvaliacao_Aluno" FROM "Avaliacao_Aluno"
      WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
    `;

    let result;
    if (existente.length > 0) {
      result = await db`
        UPDATE "Avaliacao_Aluno"
        SET "naturezaOcorrencia" = ${naturezaOcorrencia}, "restricao" = ${restricao},
            "acaoProposta" = ${acaoProposta}, "justificativa" = ${justificativa},
            "informacoesComplementares" = ${informacoesComplementares},
            "situacaoFinal" = ${situacaoFinal}
        WHERE "Conselho_idConselho" = ${conselhoId} AND "tblAluno_idtblAluno" = ${idAluno}
        RETURNING *
      `;
    } else {
      result = await db`
        INSERT INTO "Avaliacao_Aluno"
          ("Conselho_idConselho", "naturezaOcorrencia", "restricao", "acaoProposta",
           "justificativa", "informacoesComplementares", "situacaoFinal",
           "Usuario_idUsuario", "tblAluno_idtblAluno")
        VALUES
          (${conselhoId}, ${naturezaOcorrencia}, ${restricao}, ${acaoProposta},
           ${justificativa}, ${informacoesComplementares}, ${situacaoFinal},
           ${idUsuario}, ${idAluno})
        RETURNING *
      `;
    }

    return res.json({
      sucesso: true,
      mensagem: 'Avaliação de aluno salva com sucesso',
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

module.exports = router;
