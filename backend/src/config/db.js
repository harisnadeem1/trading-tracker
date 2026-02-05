const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT) || 5432,
  ssl: false, // change to true only if using cloud DB
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
  process.exit(1);
});

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection verified');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  }
}

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
