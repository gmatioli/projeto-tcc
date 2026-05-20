const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// POST SALVAR OBSERVAÇÕES
router.post('/salvar', async (req, res) => {
  const { emailUsuario, idAluno, descricao, dataObservacao, categoria } = req.body;

  if (!emailUsuario || !idAluno || !descricao || !dataObservacao) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
  }

  try {
    // Descobrir o idUsuario pelo email
    const userResult = await db`
      SELECT "idUsuario" FROM "Usuario" WHERE "emailInstitucional" = ${emailUsuario}
    `;
    
    if (userResult.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    
    const idUsuario = userResult[0].idUsuario;
    const cat = categoria || 'Geral';

    const result = await db`
      INSERT INTO "Observacao_Docente" 
      ("Usuario_idUsuario", "tblAluno_idtblAluno", "descricao", "dataObservacao", "categoria") 
      VALUES (${idUsuario}, ${idAluno}, ${descricao}, ${dataObservacao}, ${cat}) 
      RETURNING *
    `;

    res.status(201).json({ 
      sucesso: true, 
      mensagem: 'Observação gravada com sucesso!',
      observacao: result[0] 
    });

  } catch (error) {
    console.error("Erro ao gravar observação:", error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor ao salvar observação.' });
  }
});

// GET /observacoes/turma/:idTurma - BUSCA OBSERVAÇÕES DE TODA A TURMA
router.get('/turma/:idTurma', async (req, res) => {
  const { idTurma } = req.params;

  try {
    const result = await db`
      SELECT 
        o.*, 
        u."nomeUsuario" AS docente
      FROM "Observacao_Docente" o
      JOIN "tblAluno" a ON o."tblAluno_idtblAluno" = a."idtblAluno"
      JOIN "Usuario" u ON o."Usuario_idUsuario" = u."idUsuario"
      WHERE a."Turma_idTurma" = ${idTurma}
      ORDER BY o."dataObservacao" DESC
    `;

    res.json({ sucesso: true, observacoes: result });
  } catch (error) {
    console.error("Erro ao buscar observações da turma:", error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar observações.' });
  }
});

// PUT /observacoes/:idObservacao - EDITAR OBSERVAÇÃO
router.put('/:idObservacao', async (req, res) => {
  const { idObservacao } = req.params;
  const { descricao, dataObservacao } = req.body;

  if (!descricao || !dataObservacao) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
  }

  try {
    const result = await db`
      UPDATE "Observacao_Docente" 
      SET "descricao" = ${descricao}, "dataObservacao" = ${dataObservacao}
      WHERE "idObservacao_Docente" = ${idObservacao}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Observação não encontrada.' });
    }

    res.json({ sucesso: true, mensagem: 'Observação atualizada com sucesso!' });
  } catch (error) {
    console.error("Erro ao atualizar observação:", error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao atualizar observação.' });
  }
});

// DELETE /observacoes/:idObservacao - EXCLUIR OBSERVAÇÃO
router.delete('/:idObservacao', async (req, res) => {
  const { idObservacao } = req.params;

  try {
    const result = await db`
      DELETE FROM "Observacao_Docente" 
      WHERE "idObservacao_Docente" = ${idObservacao}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Observação não encontrada.' });
    }

    res.json({ sucesso: true, mensagem: 'Observação excluída com sucesso!' });
  } catch (error) {
    console.error("Erro ao excluir observação:", error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao excluir observação.' });
  }
});

// exibição para o docente
// GET /observacoes/aluno/:idAluno - BUSCA OBSERVAÇÕES DE UM ALUNO ESPECÍFICO
router.get('/aluno/:idAluno', async (req, res) => {
  const { idAluno } = req.params;

  try {
    const result = await db`
      SELECT 
        o.*, 
        u."nomeUsuario" AS docente
      FROM "Observacao_Docente" o
      JOIN "Usuario" u ON o."Usuario_idUsuario" = u."idUsuario"
      WHERE o."tblAluno_idtblAluno" = ${idAluno}
      ORDER BY o."dataObservacao" DESC
    `;

    res.json({ sucesso: true, observacoes: result });
  } catch (error) {
    console.error("Erro ao buscar observações do aluno:", error);
    res.status(500).json({ sucesso: false, message: 'Erro ao buscar observações do aluno.' });
  }
});
module.exports = router;