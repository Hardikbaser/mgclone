const mongoose = require('mongoose');
const { Pool } = require('pg');

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

  if (!process.env.MONGO_URI) {
    throw new Error('CRITICAL: MONGO_URI is missing from environment variables.');
  }

  // Connect both database clients simultaneously
  await Promise.all([
    mongoose.connect(process.env.MONGO_URI),
    postgres.query('SELECT 1'),
  ]);
  // Existing deployments may predate the cart feature, so create its small,
  // user-owned table during startup as well as documenting it in sql/schema.sql.
  await postgres.query(`CREATE TABLE IF NOT EXISTS carts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await postgres.query(`CREATE TABLE IF NOT EXISTS saved_addresses (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    address JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  
  console.log('MongoDB and PostgreSQL connected successfully.');
}

module.exports = { postgres, connectDatabases };
