const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// ==========================================
// ROTA 1: CADASTRAR USUÁRIO (POST)
// ==========================================
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, tipoAcesso } = req.body;

  // Validação: apenas emails institucionais do SENAI
  const emailValido = email.toLowerCase();
  if (!emailValido.includes('@') || !emailValido.includes('senai')) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Email inválido. Use um email institucional do SENAI.'
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    await db.query(
      `INSERT INTO "Usuario" ("nomeUsuario", "emailInstitucional", "senha", "nivelAcesso")
       VALUES ($1, $2, $3, $4)`,
      [nome, email, senhaCriptografada, tipoAcesso]
    );

    res.status(201).json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!' });

  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
  }
});

// ==========================================
// ROTA 2: LOGIN (POST)
// ==========================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM "Usuario" WHERE "emailInstitucional" = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: 'Email ou senha incorretos.' });
    }

    const usuarioEncontrado = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (senhaCorreta) {
      res.json({ sucesso: true, mensagem: 'Login efetuado com sucesso!' });
    } else {
      res.status(401).json({ sucesso: false, mensagem: 'Email ou senha incorretos.' });
    }

  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

module.exports = router;