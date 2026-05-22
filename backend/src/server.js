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
app.use('/', require('./routes/turma'));
app.use('/', require('./routes/planilha'));
app.use('/relatorio', require('./routes/relatorio'));
app.use('/conselho', require('./routes/conselho'));
app.use('/dashboard', require('./routes/dashboard')); 
app.use('/', require('./routes/termo'));
app.use('/instrumento-acompanhamento', require('./routes/instrumentoAcompanhamento'));
app.use('/AtribuirTurma', require('./routes/AtribuirTurma'));
app.use('/turmaDocente', require('./routes/turmaDocente'));
app.use('/observacoes', require('./routes/observacoes'));


// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
/* const db = require('./config/db');

app.listen(3001, async () => {
  console.log('Servidor rodando na porta 3001');
  try {
    await db`SELECT 1`;
    console.log('Conectado ao banco de dados (Neon) com sucesso!');
  } catch (erro) {
    console.error('Falha ao conectar ao banco de dados:', erro.message);
  }
}); */

const db = require('./config/db');

// O Render vai usar process.env.PORT. O 3001 fica como fallback para sua máquina local.
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  try {
    await db`SELECT 1`;
    console.log('Conectado ao banco de dados (Neon) com sucesso!');
  } catch (erro) {
    console.error('Falha ao conectar ao banco de dados:', erro.message);
  }
});