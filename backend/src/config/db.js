const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL'))
  .catch((err) => console.error('🔴 PostgreSQL connection error:', err));

module.exports = pool;
