const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// ROTA: FILTRO DE TURMAS PARA SIDEBAR (GET)
// Acessada via: GET /api/turmas-filtro
// ==========================================
router.get('/turmas-filtro', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        T."idTurma",
        T."codigo"    AS turma,
        C."nomeCurso" AS curso,
        C."tipo",
        C."area"
      FROM "Turma" T
      INNER JOIN "Cursos" C ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY C."tipo" ASC, C."nomeCurso" ASC, T."codigo" ASC
    `);

    res.json({ sucesso: true, dados: result.rows });

  } catch (erro) {
    console.error('Erro ao buscar filtros de turma:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
  }
});

// ==========================================
// ROTA: Para aparecer os alunos (GET)
// Acessada via: GET /api/turmas-filtro
// ==========================================
router.get('/alunos/:idTurma', async (req, res) => {
    const {idTurma} = req.params;

    try {
      const result = await db.query(`
        SELECT
          a."idtblAluno",
          a."matricula",
          a."nome"
        FROM "tblAluno" a
        WHERE a."Turma_idTurma" = $1
        ORDER BY a."nome" ASC
        `, [idTurma]);

      res.json({ sucesso: true, alunos: result.rows });

    } catch(erro){
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar alunos.'});
    }
})

module.exports = router;