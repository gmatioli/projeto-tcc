const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// IMPORTAÇÃO DAS ROTAS
// ==========================================
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/usuario'));
app.use('/api', require('./routes/turma'));
app.use('/', require('./routes/planilha'));
app.use('/', require('./routes/conselho'));
app.use('/', require('./routes/relatorio'));
app.use('/', require('./routes/termo'));


// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const db = require('./config/db');

app.listen(3001, async () => {

  console.log('Servidor rodando na porta 3001');
  try {
    await db`SELECT 1`;
    console.log('Conectado ao banco de dados (Neon) com sucesso!');
  } catch (erro) {
    console.error('Falha ao conectar ao banco de dados:', erro.message);
  }

});