-- Analytics visiteurs : une ligne par page vue (id anonyme localStorage, pas d'IP).
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);
-- Activité des comptes admin : « en ligne » si last_seen_at < ~5 min.
ALTER TABLE admin_users ADD COLUMN last_seen_at TEXT;
ALTER TABLE admin_users ADD COLUMN last_login_at TEXT;
