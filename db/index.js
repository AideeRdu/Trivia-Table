// Shared connection pool used by every model
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

// Render's external database URLs (…render.com) require SSL; localhost doesn't
const useSSL = /render\.com/.test(connectionString || '');

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;