-- Database Schema for AI-Powered Web Platform
-- This file defines the database schema for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  stripe_customer_id VARCHAR(255),
  business_type VARCHAR(255),
  preferences TEXT,
  last_login_at TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client preview table
CREATE TABLE IF NOT EXISTS client_previews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  preview_url TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_interval VARCHAR(50) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  plan_id INTEGER REFERENCES subscription_plans(id) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  stripe_subscription_id VARCHAR(255),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace orders table
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(id) NOT NULL,
  item_id INTEGER REFERENCES marketplace_items(id) NOT NULL,
  status VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT,
  type VARCHAR(50) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content view metrics table
CREATE TABLE IF NOT EXISTS content_view_metrics (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_time_on_page DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  feedback_type VARCHAR(50) NOT NULL,
  rating INTEGER,
  message TEXT,
  status VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mockup requests table
CREATE TABLE IF NOT EXISTS mockup_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated mockups table
CREATE TABLE IF NOT EXISTS generated_mockups (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES mockup_requests(id) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  access_token VARCHAR(255),
  status VARCHAR(50) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price recommendations table
CREATE TABLE IF NOT EXISTS price_recommendations (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES subscription_plans(id) NOT NULL,
  recommended_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  justification TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription price history table
CREATE TABLE IF NOT EXISTS subscription_price_history (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES subscription_plans(id) NOT NULL,
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  browser VARCHAR(255),
  os VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  severity VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform compatibility issues table
CREATE TABLE IF NOT EXISTS platform_compatibility_issues (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(255) NOT NULL,
  browser VARCHAR(255),
  browser_version VARCHAR(50),
  description TEXT NOT NULL,
  occurrences INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  control_variant VARCHAR(255) NOT NULL,
  test_variants JSONB NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  goal_target VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B Test Results table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES ab_tests(id) NOT NULL,
  variant VARCHAR(255) NOT NULL,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_mockup_requests_user ON mockup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_mockup_requests_status ON mockup_requests(status);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_previews_updated_at BEFORE UPDATE ON client_previews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_view_metrics_updated_at BEFORE UPDATE ON content_view_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mockup_requests_updated_at BEFORE UPDATE ON mockup_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_mockups_updated_at BEFORE UPDATE ON generated_mockups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_recommendations_updated_at BEFORE UPDATE ON price_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bug_reports_updated_at BEFORE UPDATE ON bug_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_compatibility_issues_updated_at BEFORE UPDATE ON platform_compatibility_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_test_results_updated_at BEFORE UPDATE ON ab_test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Health check function
CREATE OR REPLACE FUNCTION db_health_check() RETURNS TEXT AS $$
BEGIN
  RETURN 'Database is operational';
END;
$$ LANGUAGE plpgsql;