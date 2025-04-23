-- Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on username and email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Contact Form Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on status and email for filtering
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions(email);

-- API Usage Logs
CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  api_type VARCHAR(50) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id and api_type for filtering
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_api_type ON api_logs(api_type);

-- Settings Table for Application Configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  data_type VARCHAR(50) NOT NULL DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default settings if they don't exist
INSERT INTO settings (key, value, data_type, description)
VALUES
  ('app_name', 'AI-Driven Platform', 'string', 'Application name displayed in UI'),
  ('enable_registration', 'true', 'boolean', 'Allow new user registrations'),
  ('default_model', 'gpt-4o', 'string', 'Default OpenAI model to use'),
  ('rate_limit_general', '100', 'integer', 'General API rate limit per hour'),
  ('rate_limit_openai', '50', 'integer', 'OpenAI API rate limit per hour'),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Create an admin user if no users exist
-- Note: This is a placeholder password that should be changed immediately
-- The password is 'adminPassword123' hashed with bcrypt
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    INSERT INTO users (username, email, password, role)
    VALUES (
      'admin',
      'admin@example.com',
      '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsWB8X0V4tqm.CpYiw9l0YzI.jVxe',
      'admin'
    );
  END IF;
END
$$;