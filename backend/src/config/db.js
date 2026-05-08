// backend/src/config/db.js
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const db = neon(process.env.DATABASE_URL);

module.exports = db;