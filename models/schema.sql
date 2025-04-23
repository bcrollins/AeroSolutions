/**
 * PostgreSQL Database Schema
 */

-- Users table to store user information
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Contacts table to store contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- API logs to track API usage
CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  user_agent TEXT,
  request_body JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- OpenAI calls logs
CREATE TABLE IF NOT EXISTS openai_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  model VARCHAR(50) NOT NULL,
  prompt_type VARCHAR(50) NOT NULL,
  tokens_used INTEGER,
  response_time INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions table for user authentication
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_openai_logs_user_id ON openai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_logs_model ON openai_logs(model);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Add sample admin user (password: admin123)
-- Note: In production, passwords should never be hardcoded in database schema files
-- This is only for development purposes
INSERT INTO users (username, email, password, role, created_at)
VALUES 
  ('admin', 'admin@example.com', '$2b$10$Jg5wjVL3D0YXEjw8eJJ4ZOaLjoOSRRTg5Ug9DP5znDqcU7DwWvL3i', 'admin', NOW())
ON CONFLICT (username) DO NOTHING;