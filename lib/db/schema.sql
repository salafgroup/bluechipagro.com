-- Reserva Varde Goa Database Schema
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales_agent', -- 'admin', 'sales_manager', 'sales_agent'
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1, -- 1 = active, 0 = revoked
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  session_token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL, -- e.g. RVG-2026-0001
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  buyer_type TEXT, -- 'Second Home', 'Agro-estate Investor', 'Wellness Retreat', etc.
  estate_model TEXT, -- '2BHK 2500 sq.ft', '3BHK 3500 sq.ft', '4BHK 4500 sq.ft', 'Custom Estate'
  budget_range TEXT,
  city_country TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'site_visit_scheduled', 'cost_sheet_sent', 'negotiation', 'closed_won', 'closed_lost', 'archived'
  assigned_staff_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  follow_up_date TEXT,
  duplicate_hash TEXT NOT NULL,
  source TEXT DEFAULT 'website_contact_form',
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS enquiry_notes (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL REFERENCES staff_users(id),
  note_type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'status_change', 'assignment', 'call_log'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email', -- 'email', 'webhook'
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed', 'dead_letter'
  claim_token TEXT,
  claim_expires_at TEXT,
  provider_message_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_error TEXT,
  next_retry_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiry_dedup_locks (
  duplicate_hash TEXT PRIMARY KEY,
  reference_id TEXT NOT NULL,
  enquiry_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  expires_at TEXT NOT NULL
);

-- Indices for rapid querying and constraint checks
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON staff_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON staff_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_duplicate_hash ON enquiries(duplicate_hash);
CREATE INDEX IF NOT EXISTS idx_enquiry_notes_enquiry ON enquiry_notes(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_dedup_locks_expires ON enquiry_dedup_locks(expires_at);
