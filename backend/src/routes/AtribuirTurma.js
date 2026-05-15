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