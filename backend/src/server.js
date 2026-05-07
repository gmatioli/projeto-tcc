const express = require('express');
const cors = require('cors');
const instrumentoRouter = require('./routes/instrumentoAcompanhamento');


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
app.use('/instrumento-acompanhamento', instrumentoRouter);


// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});