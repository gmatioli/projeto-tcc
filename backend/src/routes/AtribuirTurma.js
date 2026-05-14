const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// LISTAR DOCENTES
// ==========================================
router.get('/docentes', async (req, res) => {
  try {
    const result = await db`
      SELECT 
        u."idUsuario",
        u."nomeUsuario"
      FROM "Usuario" u
      WHERE u."nivelAcesso" = 'docente'
      ORDER BY u."nomeUsuario" ASC
    `;

    console.log(` Docentes carregados: ${result.length}`);
    res.json(result);

  } catch (erro) {
    console.error('ERRO ao buscar docentes:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar docentes' });
  }
});

// ==========================================
// LISTAR TURMAS (mantido)
// ==========================================
router.get('/turmas', async (req, res) => {
  try {
    const result = await db`
      SELECT 
        "idTurma",
        "codigo"
      FROM "Turma"
      ORDER BY "codigo" ASC
    `;
    res.json(result);
  } catch (erro) {
    console.error('ERRO ao buscar turmas:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar turmas' });
  }
});

module.exports = router;