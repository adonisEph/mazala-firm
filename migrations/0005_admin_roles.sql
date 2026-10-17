-- Multi-admins : rôle + permissions granulaires par section.
-- role : 'superadmin' (tous droits + gestion des comptes) | 'admin' (droits accordés).
-- permissions : JSON array parmi ["projects","team","messages"].
-- Les comptes existants deviennent superadmin (comportement inchangé).

ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE admin_users ADD COLUMN permissions TEXT NOT NULL DEFAULT '[]';

UPDATE admin_users SET role = 'superadmin';
