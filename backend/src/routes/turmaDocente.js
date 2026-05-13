const express = require('express');
const router = express.Router();
const db = require('../config/db');
 
// ============================================================
// GET /api/docente/turmas?idUsuario=X
// Retorna as turmas atribuídas ao docente logado,
// com estrutura já pronta para a sidebar (tipo, curso, turma)
// ============================================================
router.get('/turmas', async (req, res) => {
  const { idUsuario } = req.query;
 
  if (!idUsuario) {
    return res.status(400).json({ sucesso: false, mensagem: 'idUsuario não informado.' });
  }
 
  try {
    const result = await db`
      SELECT
        T."idTurma",
        T."codigo"    AS turma,
        C."nomeCurso" AS curso,
        C."tipo",
        C."area"
      FROM "DocenteTurma" DT
      INNER JOIN "Turma"  T ON DT."Turma_idTurma"     = T."idTurma"
      INNER JOIN "Cursos" C ON T."Cursos_idCurso"      = C."idCurso"
      INNER JOIN "Usuario" U ON DT."Usuario_idUsuario" = U."idUsuario"
      WHERE U."idUsuario" = ${idUsuario}
      ORDER BY C."tipo" ASC, C."nomeCurso" ASC, T."codigo" ASC
    `;
 
    res.json({ sucesso: true, dados: result });
 
  } catch (erro) {
    console.error('Erro ao buscar turmas do docente:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
  }
});
 
// ============================================================
// GET /api/docente/alunos/:idTurma
// Retorna os alunos de uma turma específica
// (reutiliza a lógica já existente, mas centralizada aqui)
// ============================================================
router.get('/alunos/:idTurma', async (req, res) => {
  const { idTurma } = req.params;
 
  try {
    const result = await db`
      SELECT
        a."idtblAluno",
        a."matricula",
        a."nome"
      FROM "tblAluno" a
      WHERE a."Turma_idTurma" = ${idTurma}
      ORDER BY a."nome" ASC
    `;
 
    res.json({ sucesso: true, alunos: result });
 
  } catch (erro) {
    console.error('Erro ao buscar alunos da turma:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar alunos.' });
  }
});
 
module.exports = router;