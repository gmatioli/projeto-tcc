const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// LISTAR TURMAS
// GET -> /api/turmas
// ==========================================
router.get('/turmas', async (req, res) => {
  try {
    const result = await db`
      SELECT
        T."idTurma",
        T."codigo",
        C."tipo"
      FROM "Turma" T
      INNER JOIN "Cursos" C
        ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY T."codigo" ASC
    `;

    res.json(result);

  } catch (erro) {
    console.log('ERRO TURMAS:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar turmas'
    });
  }
});

// ==========================================
// LISTAR ALUNOS DA TURMA
// GET -> /api/alunos?turma=DEV 3N
// ==========================================
router.get('/alunos', async (req, res) => {
  try {
    const { turma } = req.query;

    const result = await db`
      SELECT
        A."nome"
      FROM "tblAluno" A
      INNER JOIN "Turma" T
        ON A."Turma_idTurma" = T."idTurma"
      WHERE T."codigo" = ${turma}
      ORDER BY A."nome" ASC
    `;

    res.json(result);

  } catch (erro) {
    console.log('ERRO ALUNOS:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar alunos'
    });
  }
});

// ==========================================
// ROTA: FILTRO DE TURMAS PARA SIDEBAR (GET)
// Acessada via: GET /api/turmas-filtro
// ==========================================
router.get('/turmas-filtro', async (req, res) => {
  try {
    const result = await db`
      SELECT
        T."idTurma",
        T."codigo"    AS turma,
        C."nomeCurso" AS curso,
        C."tipo",
        C."area"
      FROM "Turma" T
      INNER JOIN "Cursos" C ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY C."tipo" ASC, C."nomeCurso" ASC, T."codigo" ASC
    `;

    res.json({ sucesso: true, dados: result });

  } catch (erro) {
    console.error('Erro ao buscar filtros de turma:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
  }
});

// ==========================================
// ROTA: FILTRO DE TURMAS PARA CONSELHO FINAL  (GET)
// Acessada via: GET /api/turmas-filtro
// ==========================================
router.get('/turmas-filtro/pre-conselho', async (req, res) => {
  try {
    const result = await db`
      SELECT
        T."idTurma",
        T."codigo"    AS turma,
        C."nomeCurso" AS curso,
        C."tipo",
        C."area"
      FROM "Turma" T
      INNER JOIN "Cursos" C ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY C."tipo" ASC, C."nomeCurso" ASC, T."codigo" ASC
    `;

    res.json({ sucesso: true, dados: result });

  } catch (erro) {
    console.error('Erro ao buscar filtros de turma:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
  }
});

// ==========================================
// ROTA: Para aparecer os alunos (GET)
// Acessada via: GET /api/alunos/:idTurma
// ==========================================
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
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar alunos.' });
  }
});


// ==========================================
// ROTA: Para aparecer se aluno tem empresa (GET)
// Acessada via: GET /api/alunos/empresa
// ==========================================
router.get('/alunos/empresa/:idTurma', async (req, res) => {
  const { idTurma } = req.params;
  
  if (!idTurma) return res.status(400).json({ sucesso: false, mensagem: 'idTurma é obrigatório.' });

  try {
    const result = await db`
      SELECT a."idtblAluno", a.nome, e."empresaContrato" AS "nomeEmpresa"
      FROM "tblAluno" a
      LEFT JOIN "Empresa" e ON a."Empresa_idEmpresa" = e."idEmpresa"
      WHERE a."Turma_idTurma" = ${idTurma}
      ORDER BY lower(a."nome") ASC
    `;
    res.json({ sucesso: true, alunos: result });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar alunos.' });
  }
});

module.exports = router;
