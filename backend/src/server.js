const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors()); // Libera o acesso para o React
app.use(express.json());

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));