const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. LISTAR DOCENTES
router.get('/docentes', async (req, res) => {
  try {
    const result = await db`
      SELECT u."idUsuario", u."nomeUsuario"
      FROM "Usuario" u
      WHERE u."nivelAcesso" = 'docente'
      ORDER BY u."nomeUsuario" ASC
    `;
    res.json(result);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar docentes' });
  }
});

// 2. LISTAR TURMAS
router.get('/turmas', async (req, res) => {
  try {
    const result = await db`
      SELECT t."idTurma", t."codigo", c."tipo" 
      FROM "Turma" t
      JOIN "Cursos" c ON t."Cursos_idCurso" = c."idCurso"
      ORDER BY t."codigo" ASC
    `;
    res.json(result);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar turmas' });
  }
});

// ==========================================
// BUSCAR TURMAS ATUAIS DO DOCENTE
// ==========================================
router.get('/docente/:id/turmas', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db`
      SELECT t."idTurma", t."codigo"
      FROM "Turma" t
      JOIN "Docente_Turma" dt ON t."idTurma" = dt."Turma_idTurma"
      WHERE dt."Usuario_idUsuario" = ${id}
    `;
    
    res.json(result);
  } catch (erro) {
    console.error('Erro ao buscar turmas atuais do docente:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar turmas do docente' });
  }
});

// ==========================================
// EXCLUIR TURMA DO DOCENTE
// ==========================================
router.delete('/docente/:idDocente/turma/:idTurma', async (req, res) => {
  const { idDocente, idTurma } = req.params;

  try {
    // Deleta a relação específica no banco de dados
    await db`
      DELETE FROM "Docente_Turma"
      WHERE "Usuario_idUsuario" = ${idDocente} AND "Turma_idTurma" = ${idTurma}
    `;

    res.json({ sucesso: true, mensagem: 'Turma do docente removida' });
  } catch (erro) {
    console.error('Erro ao excluir turma do docente:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir a turma' });
  }
});

// ==========================================
// 3. SALVAR ATRIBUIÇÕES (MODO ADITIVO)
// ==========================================
router.post('/salvar', async (req, res) => {
  const { idDocente, turmas } = req.body;

  if (!idDocente) {
    return res.status(400).json({ sucesso: false, mensagem: 'Selecione um docente' });
  }

  try {
    // REMOVEMOS O DELETE DAQUI. 
    // Assim, o que já está no banco não é tocado.

    if (turmas && turmas.length > 0) {
      for (const idTurma of turmas) {
        // Usamos "ON CONFLICT DO NOTHING". 
        // Isso serve para: se você tentar adicionar uma turma que o docente 
        // JÁ TEM, o banco ignora e não gera um erro de duplicata.
        await db`
          INSERT INTO "Docente_Turma" ("Usuario_idUsuario", "Turma_idTurma")
          VALUES (${idDocente}, ${idTurma})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    res.json({ sucesso: true, mensagem: 'Novas turmas adicionadas sem apagar as anteriores!' });
  } catch (erro) {
    console.error('Erro ao salvar no banco:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao salvar' });
  }
});

module.exports = router;