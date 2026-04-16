const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mydb'
});

connection.connect(error => {
  if (error) throw error;
  console.log("Conectado ao MySQL com sucesso!");
});

module.exports = connection;