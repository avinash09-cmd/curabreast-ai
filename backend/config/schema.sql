-- CuraBreast AI Database Schema
-- Run this file to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  age INTEGER CHECK (age > 0 AND age < 150),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile_image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  family_history BOOLEAN DEFAULT FALSE,
  lump_detected BOOLEAN DEFAULT FALSE,
  breast_pain BOOLEAN DEFAULT FALSE,
  skin_changes BOOLEAN DEFAULT FALSE,
  nipple_discharge BOOLEAN DEFAULT FALSE,
  smoking_history BOOLEAN DEFAULT FALSE,
  alcohol_consumption VARCHAR(20) DEFAULT 'none' CHECK (alcohol_consumption IN ('none', 'occasional', 'moderate', 'heavy')),
  physical_activity VARCHAR(20) DEFAULT 'moderate' CHECK (physical_activity IN ('sedentary', 'light', 'moderate', 'active')),
  symptoms JSONB DEFAULT '{}',
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_risk_level ON assessments(risk_level);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  report_type VARCHAR(50) DEFAULT 'assessment',
  report_url VARCHAR(500),
  report_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_user_id ON reports(user_id);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  hospital_address VARCHAR(500),
  doctor_name VARCHAR(255),
  appointment_date TIMESTAMP NOT NULL,
  appointment_type VARCHAR(100) DEFAULT 'consultation',
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Password resets table
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE OR REPLACE VIEW assessment_stats AS
SELECT
  u.id as user_id,
  u.fullname,
  COUNT(a.id) as total_assessments,
  AVG(a.risk_score) as avg_risk_score,
  MAX(a.created_at) as last_assessment_date,
  SUM(CASE WHEN a.risk_level = 'high' THEN 1 ELSE 0 END) as high_risk_count
FROM users u
LEFT JOIN assessments a ON u.id = a.user_id
GROUP BY u.id, u.fullname;

COMMENT ON TABLE users IS 'CuraBreast user accounts';
COMMENT ON TABLE assessments IS 'Breast health risk assessments';
COMMENT ON TABLE reports IS 'Generated health reports';
COMMENT ON TABLE appointments IS 'Hospital/clinic appointments';

-- ============================================================
-- PERIOD TRACKER TABLES (added in v2)
-- ============================================================

CREATE TABLE IF NOT EXISTS period_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_start DATE NOT NULL,
  cycle_end DATE,
  period_length INTEGER,          -- days of bleeding
  cycle_length INTEGER,           -- days from this start to next start
  flow VARCHAR(20) DEFAULT 'medium' CHECK (flow IN ('light', 'medium', 'heavy', 'spotting')),
  mood VARCHAR(30) DEFAULT 'neutral' CHECK (mood IN ('happy', 'neutral', 'sad', 'anxious', 'irritable', 'tired', 'energetic')),
  symptoms JSONB DEFAULT '[]',    -- ["cramps","headache","bloating","backpain","nausea","fatigue","spotting"]
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_period_logs_user_id ON period_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_period_logs_cycle_start ON period_logs(cycle_start DESC);

CREATE TRIGGER update_period_logs_updated_at BEFORE UPDATE ON period_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- USER PREFERENCES (theme, notifications) — v2
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notif_period BOOLEAN DEFAULT TRUE,
  notif_ovulation BOOLEAN DEFAULT TRUE,
  notif_self_exam BOOLEAN DEFAULT TRUE,
  notif_medication BOOLEAN DEFAULT FALSE,
  notif_ai BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE period_logs IS 'Menstrual cycle tracking logs';
COMMENT ON TABLE user_preferences IS 'Per-user app preferences (theme, notifications)';
