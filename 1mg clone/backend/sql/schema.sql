CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'DOCTOR', 'LAB_TECH', 'ADMIN')),
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token_hash TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'PENDING',
  delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PLACED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_addresses (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  address JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
