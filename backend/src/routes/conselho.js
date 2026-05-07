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

    // Validação
    if (!tipoConselho || !idTurma || !idUsuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios faltando'
      });
    }

    // 1. Criar registro em Conselho
    const resultConselho = await db.query(
      `INSERT INTO "Conselho" 
        ("tipoConselho", "dataInicio", "status", "Usuario_idUsuario") 
      VALUES 
        ($1, NOW(), $2, $3) 
      RETURNING "idConselho"`,
      [tipoConselho, 'Em Progresso', idUsuario]
    );

    const conselhoId = resultConselho.rows[0].idConselho;

    // 2. Inserir relação Conselho_Turma
    await db.query(
      `INSERT INTO "Conselho_Turma" 
        ("Conselho_idConselho", "Turma_idTurma", "dataAdicao") 
      VALUES 
        ($1, $2, NOW())`,
      [conselhoId, idTurma]
    );

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

    // Atualizar status do conselho
    const result = await db.query(
      `UPDATE "Conselho" 
       SET "status" = $1, "dataFinalizacao" = NOW() 
       WHERE "idConselho" = $2 
       RETURNING *`,
      ['Finalizado', conselhoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Conselho não encontrado'
      });
    }

    return res.json({
      sucesso: true,
      mensagem: 'Conselho finalizado com sucesso',
      conselho: result.rows[0]
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

    // Buscar conselho
    const resultConselho = await db.query(
      `SELECT * FROM "Conselho" WHERE "idConselho" = $1`,
      [conselhoId]
    );

    if (resultConselho.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Conselho não encontrado'
      });
    }

    // Buscar turmas associadas
    const resultTurmas = await db.query(
      `SELECT t.* FROM "Turma" t
       INNER JOIN "Conselho_Turma" ct ON t."idTurma" = ct."Turma_idTurma"
       WHERE ct."Conselho_idConselho" = $1`,
      [conselhoId]
    );

    // Buscar avaliações de turma
    const resultAvaliacoesTurma = await db.query(
      `SELECT * FROM "Avaliacao_Turma" WHERE "Conselho_idConselho" = $1`,
      [conselhoId]
    );

    // Buscar avaliações de alunos
    const resultAvaliacoesAlunos = await db.query(
      `SELECT aa.*, a."nome" 
       FROM "Avaliacao_Aluno" aa
       INNER JOIN "tblAluno" a ON aa."tblAluno_idtblAluno" = a."idtblAluno"
       WHERE aa."Conselho_idConselho" = $1`,
      [conselhoId]
    );

    return res.json({
      sucesso: true,
      conselho: {
        ...resultConselho.rows[0],
        turmas: resultTurmas.rows,
        avaliacoesTurma: resultAvaliacoesTurma.rows,
        avaliacoesAlunos: resultAvaliacoesAlunos.rows
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

    // Verificar se já existe avaliação de turma para este conselho
    const existente = await db.query(
      `SELECT "idAvaliacao_Turma" FROM "Avaliacao_Turma" 
       WHERE "Conselho_idConselho" = $1`,
      [conselhoId]
    );

    let result;
    if (existente.rows.length > 0) {
      // UPDATE
      result = await db.query(
        `UPDATE "Avaliacao_Turma" 
         SET "organizacao" = $1, "comportamental" = $2, "assiduidade" = $3,
             "disponibilidade_Aprendizado" = $4, "observacao" = $5,
             "alcancou_Objetivos" = $6
         WHERE "Conselho_idConselho" = $7
         RETURNING *`,
        [organizacao, comportamental, assiduidade, disponibilidade_Aprendizado, 
         observacao, alcancou_Objetivos, conselhoId]
      );
    } else {
      // INSERT
      result = await db.query(
        `INSERT INTO "Avaliacao_Turma" 
          ("Conselho_idConselho", "organizacao", "comportamental", "assiduidade",
           "disponibilidade_Aprendizado", "observacao", "alcancou_Objetivos") 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [conselhoId, organizacao, comportamental, assiduidade, 
         disponibilidade_Aprendizado, observacao, alcancou_Objetivos]
      );
    }

    return res.json({
      sucesso: true,
      mensagem: 'Avaliação de turma salva com sucesso',
      avaliacao: result.rows[0]
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

    // Verificar se já existe avaliação deste aluno neste conselho
    const existente = await db.query(
      `SELECT "idAvaliacao_Aluno" FROM "Avaliacao_Aluno" 
       WHERE "Conselho_idConselho" = $1 AND "tblAluno_idtblAluno" = $2`,
      [conselhoId, idAluno]
    );

    let result;
    if (existente.rows.length > 0) {
      // UPDATE
      result = await db.query(
        `UPDATE "Avaliacao_Aluno" 
         SET "naturezaOcorrencia" = $1, "restricao" = $2, "acaoProposta" = $3,
             "justificativa" = $4, "informacoesComplementares" = $5,
             "situacaoFinal" = $6
         WHERE "Conselho_idConselho" = $7 AND "tblAluno_idtblAluno" = $8
         RETURNING *`,
        [naturezaOcorrencia, restricao, acaoProposta, justificativa,
         informacoesComplementares, situacaoFinal, conselhoId, idAluno]
      );
    } else {
      // INSERT
      result = await db.query(
        `INSERT INTO "Avaliacao_Aluno" 
          ("Conselho_idConselho", "naturezaOcorrencia", "restricao", "acaoProposta",
           "justificativa", "informacoesComplementares", "situacaoFinal", 
           "Usuario_idUsuario", "tblAluno_idtblAluno") 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [conselhoId, naturezaOcorrencia, restricao, acaoProposta, justificativa,
         informacoesComplementares, situacaoFinal, idUsuario, idAluno]
      );
    }

    return res.json({
      sucesso: true,
      mensagem: 'Avaliação de aluno salva com sucesso',
      avaliacao: result.rows[0]
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
