const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Fallback to process.env.POSTGRES_URL if DATABASE_URL isn't explicitly defined
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 2. Configure PostgreSQL pool with SSL enabled for Supabase / Cloud Postgres
const postgres = new Pool({ 
  connectionString,
  ssl: { 
    rejectUnauthorized: false // Required for Supabase cloud connections
  } 
});

async function connectDatabases() {
  if (!connectionString) {
    throw new Error('CRITICAL: PostgreSQL connection string (DATABASE_URL / POSTGRES_URL) is missing from environment variables.');
  }

  await postgres.query('SELECT 1');
  await postgres.query(fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8'));
  console.log('PostgreSQL connected successfully.');
}

module.exports = { postgres, connectDatabases };
