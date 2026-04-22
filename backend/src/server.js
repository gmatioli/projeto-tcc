const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const app = express();

// --- CONFIGURAÇÕES BÁSICAS ---
app.use(cors()); // Libera o acesso para o React
app.use(express.json()); // Permite que o Node entenda dados em formato JSON (importante para o login)

// ==========================================
// ROTA 1: CADASTRAR USUÁRIO (POST)
// ==========================================
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, tipoAcesso } = req.body;

  // Trava de segurança no Backend: Verifica se é um email SENAI
  const emailValido = email.toLowerCase();
  if (!emailValido.includes('@') || !emailValido.includes('senai')) {
    return res.status(400).json({ sucesso: false, mensagem: "Email inválido. Use um email institucional do SENAI." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const sql = `INSERT INTO Usuario (nomeUsuario, emailInstitucional, senha, nivelAcesso) 
                 VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [nome, email, senhaCriptografada, tipoAcesso], (err, results) => {
      if (err) {
        console.error("Erro ao inserir no banco:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar usuário no banco." });
      }
      res.status(201).json({ sucesso: true, mensagem: "Usuário cadastrado com sucesso!" });
    });

  } catch (erro) {
    console.error("Erro interno:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor." });
  }
});


// ==========================================
// ROTA 2: FAZER O LOGIN (POST) - AGORA POR EMAIL
// ==========================================
app.post('/login', (req, res) => {
  // Alteramos para receber 'email' do frontend
  const { email, senha } = req.body; 

  // Busca APENAS pelo emailInstitucional
  const sql = "SELECT * FROM Usuario WHERE emailInstitucional = ?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ erro: "Erro interno no servidor" });
    }

    if (results.length > 0) {
      const usuarioEncontrado = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

      if (senhaCorreta) {
        res.json({ sucesso: true, mensagem: "Login efetuado com sucesso!" });
      } else {
        res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
      }
      
    } else {
      res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
    }
  });
});


// ==========================================
// ROTA 3: LISTAR USUÁRIOS (GET)
// ==========================================
app.get('/usuarios', (req, res) => {
  // Busca apenas o ID e o Nome (não precisamos trazer a senha pro frontend!)
  const sql = "SELECT idUsuario, nomeUsuario FROM Usuario ORDER BY nomeUsuario ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuários:", err);
      return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar a lista de usuários." });
    }
    res.json({ sucesso: true, usuarios: results });
  });
});

// ==========================================
// ROTA 4: ATUALIZAR SENHA DO USUÁRIO (PUT)
// ==========================================
app.put('/usuarios/senha', async (req, res) => {
  const { idUsuario, novaSenha } = req.body;

  try {
    // 1. Criptografa a nova senha gerada pelo admin
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

    // 2. Atualiza no banco de dados
    const sql = "UPDATE Usuario SET senha = ? WHERE idUsuario = ?";
    
    db.query(sql, [senhaCriptografada, idUsuario], (err, results) => {
      if (err) {
        console.error("Erro ao atualizar senha:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar a senha no banco." });
      }
      res.json({ sucesso: true, mensagem: "Senha atualizada com sucesso!" });
    });

  } catch (erro) {
    console.error("Erro interno:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor." });
  }
});

// ==========================================
// ROTA 5: BUSCAR DADOS DO PERFIL (GET)
// ==========================================
app.get('/perfil/:email', (req, res) => {
  const emailLogado = req.params.email;
  
  const sql = "SELECT nomeUsuario, emailInstitucional, nivelAcesso FROM Usuario WHERE emailInstitucional = ?";  
  
  db.query(sql, [emailLogado], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
    }
    
    // Se encontrou o usuário, devolve os dados para o React
    if (results.length > 0) {
      res.json({ sucesso: true, usuario: results[0] });
    } else {
      res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }
  });
});



// --- INICIALIZAÇÃO DO SERVIDOR ---
// Isso sempre tem que ser a última coisa do arquivo!
app.listen(3001, () => {
  console.log("Servidor rodando perfeitamente na porta 3001");
});