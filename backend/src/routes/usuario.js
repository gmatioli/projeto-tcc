const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// ==========================================
// ROTA 3: LISTAR USUÁRIOS (GET)
// ==========================================
router.get('/usuarios', async (req, res) => {
  try {
     const result = await db`
      SELECT "idUsuario", "nomeUsuario" FROM "Usuario" ORDER BY "nomeUsuario" ASC
    `;


    res.json({ sucesso: true, usuarios: result });

  } catch (erro) {
    console.error('Erro ao buscar usuários:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar a lista de usuários.' });
  }
});

// ==========================================
// ROTA 4: ATUALIZAR SENHA DO USUÁRIO (PUT)
// ==========================================
router.put('/usuarios/senha', async (req, res) => {
  const { idUsuario, novaSenha } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

    await db`
      UPDATE "Usuario" SET "senha" = ${senhaCriptografada} WHERE "idUsuario" = ${idUsuario}
    `;

    res.json({ sucesso: true, mensagem: 'Senha atualizada com sucesso!' });

  } catch (erro) {
    console.error('Erro ao atualizar senha:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar a senha.' });
  }
});

// ==========================================
// ROTA 5: BUSCAR DADOS DO PERFIL (GET)
// ==========================================
router.get('/perfil/:email', async (req, res) => {
  const emailLogado = req.params.email;

  try {
    const result = await db`
      SELECT "nomeUsuario", "emailInstitucional", "nivelAcesso"
      FROM "Usuario"
      WHERE "emailInstitucional" = ${emailLogado}
    `;



    if (result.length > 0) {
      res.json({ sucesso: true, usuario: result[0] });
    } else {
      res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
  }
});

module.exports = router;