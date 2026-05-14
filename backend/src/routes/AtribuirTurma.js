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

// 3. SALVAR ATRIBUIÇÕES (CORRIGIDO)
router.post('/salvar', async (req, res) => {
  const { idDocente, turmas } = req.body;

  if (!idDocente) {
    return res.status(400).json({ sucesso: false, mensagem: 'Selecione um docente' });
  }

  try {
    // Primeiro deleta as antigas
    await db`
      DELETE FROM "Docente_Turma" 
      WHERE "Usuario_idUsuario" = ${idDocente}
    `;

    // Depois insere as novas
    if (turmas && turmas.length > 0) {
      for (const idTurma of turmas) {
        await db`
          INSERT INTO "Docente_Turma" ("Usuario_idUsuario", "Turma_idTurma")
          VALUES (${idDocente}, ${idTurma})
        `;
      }
    }

    res.json({ sucesso: true, mensagem: 'Salvo com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar no banco' });
  }
});

module.exports = router;