const express = require('express');
const router = express.Router();

const db = require('../config/db');

// ==========================================
// BUSCAR DATAS
// ==========================================
router.get('/datas', async (req, res) => {
  try {
    console.log(' Buscando datas...');

    const result = await db`
      SELECT 
        "idConselho",
        TO_CHAR("dataRealizacao", 'DD/MM/YYYY') AS "dataFormatada"
      FROM "Conselho"
      ORDER BY "dataRealizacao" DESC
      LIMIT 10
    `;

    console.log(`Datas OK: ${result.length} registros`);
    res.json(result);

  } catch (erro) {
    console.error(' ERRO ao buscar datas:', erro.message);
    console.error('Stack:', erro.stack);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar datas',
      detalhe: erro.message 
    });
  }
});

// ==========================================
// BUSCAR TURMAS
// ==========================================
router.get('/turmas', async (req, res) => {
  try {
    console.log(' Buscando turmas...');

    const result = await db`
      SELECT 
        T."idTurma",
        T."codigo",
        C."tipo"
      FROM "Turma" T
      LEFT JOIN "Cursos" C ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY T."codigo" ASC
      LIMIT 20
    `;

    console.log(` Turmas OK: ${result.length} registros`);
    res.json(result);

  } catch (erro) {
    console.error(' ERRO ao buscar turmas:', erro.message);
    console.error('Stack completo:', erro.stack);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar turmas',
      detalhe: erro.message 
    });
  }
});

module.exports = router;