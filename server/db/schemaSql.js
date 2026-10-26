export const SCHEMA_SQL = `
-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  policy_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facility Session Capacities
CREATE TABLE IF NOT EXISTS facility_session_capacities (
  facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
  session_id VARCHAR(50) REFERENCES sessions(id) ON DELETE CASCADE,
  capacity INT NOT NULL CHECK (capacity >= 0),
  PRIMARY KEY (facility_id, session_id)
);

-- Staff Users
CREATE TABLE IF NOT EXISTS staff_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_ref VARCHAR(30) UNIQUE NOT NULL,
  checkin_token_hash VARCHAR(64) NOT NULL,
  management_token VARCHAR(64) NOT NULL,
  facility_id VARCHAR(50) REFERENCES facilities(id),
  session_id VARCHAR(50) REFERENCES sessions(id),
  visit_date DATE NOT NULL,
  visitor_name VARCHAR(150) NOT NULL,
  visitor_email VARCHAR(150) NOT NULL,
  membership_no VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by INT REFERENCES staff_users(id)
);

-- Closure Dates and Schedule Overrides
CREATE TABLE IF NOT EXISTS closure_dates (
  id SERIAL PRIMARY KEY,
  override_date DATE UNIQUE NOT NULL,
  is_closed BOOLEAN DEFAULT TRUE,
  reason TEXT,
  created_by INT REFERENCES staff_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  actor_type VARCHAR(30) NOT NULL,
  actor_id VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High Performance and Integrity
CREATE INDEX IF NOT EXISTS idx_bookings_date_facility_session 
  ON bookings (visit_date, facility_id, session_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_email_date 
  ON bookings (visitor_email, visit_date, status);

CREATE INDEX IF NOT EXISTS idx_bookings_ref 
  ON bookings (booking_ref);

CREATE INDEX IF NOT EXISTS idx_bookings_checkin_token 
  ON bookings (checkin_token_hash);

CREATE INDEX IF NOT EXISTS idx_audit_events_created 
  ON audit_events (created_at DESC);

-- Books Catalog
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  copies_total INT DEFAULT 1,
  copies_available INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Library Members
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(30) DEFAULT 'active',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Circulation Loans & Transactions
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  loan_code VARCHAR(30) UNIQUE NOT NULL,
  book_id INT REFERENCES books(id) ON DELETE SET NULL,
  member_id INT REFERENCES members(id) ON DELETE SET NULL,
  type VARCHAR(30) DEFAULT 'Loan',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pre-aggregated Monthly / Weekly / Yearly Circulation Statistics
CREATE TABLE IF NOT EXISTS circulation_stats (
  id SERIAL PRIMARY KEY,
  period_type VARCHAR(20) NOT NULL,
  period_key VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  period_label VARCHAR(30) NOT NULL,
  issued_count INT NOT NULL DEFAULT 0,
  returned_count INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(period_type, period_key, year)
);

-- Overdue Daily Trend Data
CREATE TABLE IF NOT EXISTS overdue_daily_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE UNIQUE NOT NULL,
  overdue_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_issue_date ON loans(issue_date);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
`;
