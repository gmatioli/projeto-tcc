// const { neon } = require('@neondatabase/serverless');
// require('dotenv').config();

// const db = neon(process.env.DATABASE_URL);

// module.exports = db;


//require('dotenv').config();

const postgres = require('postgres');

// Ele vai buscar a variável DATABASE_URL que vamos configurar lá no painel do Render
const db = postgres(process.env.DATABASE_URL, {
 ssl: 'require', // Isso é OBRIGATÓRIO para o Neon funcionar na nuvem
});

module.exports = db;
