const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// --- CONFIGURAÇÕES BÁSICAS ---
app.use(cors()); // Libera o acesso para o React
app.use(express.json()); // Permite que o Node entenda dados em formato JSON (importante para o login)

// --- ROTAS (O "Cardápio" do Backend) ---

// Rota 2: Fazer o Login (POST)
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body; 

  // Lembre-se de checar se a sua tabela chama "administradores" mesmo
  const sql = "SELECT * FROM Usuario WHERE nomeUsuario = ? AND senha = ?";
  
  db.query(sql, [usuario, senha], (err, results) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ erro: "Erro interno no servidor" });
    }

    if (results.length > 0) {
      // Achou! Login autorizado.
      res.json({ sucesso: true, mensagem: "Login efetuado com sucesso!" });
    } else {
      // Não achou.
      res.status(401).json({ sucesso: false, mensagem: "Usuário ou senha incorretos." });
    }
  });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Isso sempre tem que ser a última coisa do arquivo!
app.listen(3001, () => {
  console.log("Servidor rodando perfeitamente na porta 3001");
});