const express = require('express');
const cors = require('cors');

const { autenticar, exigirNivel } = require('./middleware/authToken');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// IMPORTAÇÃO DAS ROTAS
// ==========================================
// PÚBLICAS
app.use('/', require('./routes/auth'));

// ADMIN
app.use('/relatorio', autenticar, exigirNivel('admin'),  require('./routes/relatorio'));
app.use('/conselho', autenticar, exigirNivel('admin'), require('./routes/conselho'));
app.use('/dashboard', autenticar, exigirNivel('admin'), require('./routes/dashboard')); 
app.use('/atribuirTurma', autenticar, exigirNivel('admin'), require('./routes/AtribuirTurma'));

// DOCENTE
app.use('/instrumento-acompanhamento', autenticar, exigirNivel('docente'), require('./routes/instrumentoAcompanhamento'));
app.use('/turmaDocente', autenticar, exigirNivel('docente'), require('./routes/turmaDocente'));

// COMPARTILHADAS
app.use('/observacoes', autenticar, require('./routes/observacoes'));

// proteção por rota (dentro de cada arquivo)
app.use('/', require('./routes/usuario'));
app.use('/', require('./routes/turma'));
app.use('/', require('./routes/planilha'));
app.use('/', require('./routes/termo'));


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