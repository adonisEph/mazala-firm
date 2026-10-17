-- Portfolio enrichi : lien projet + plateforme cible.
-- D1/SQLite : ALTER TABLE ADD COLUMN seul (pas de IF NOT EXISTS → idempotent via try/catch côté seed).

ALTER TABLE projects ADD COLUMN project_url TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN platform TEXT NOT NULL DEFAULT '';   -- 'web' | 'mobile' | 'desktop' | '' (multi-plateforme)
