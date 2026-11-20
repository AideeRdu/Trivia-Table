// Creates the tables and loads the seed data: npm run db:setup
const fs = require('fs');
const path = require('path');
const pool = require('./index');

async function setup() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  try {
    await pool.query(schema);
    await pool.query(seed);
    console.log('Database tables created and seed data inserted.');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();
