-- Stockage des images uploadées via le back-office (BLOB D1 — pas besoin de R2).
-- Servies publiquement via GET /api/images/[id].

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
