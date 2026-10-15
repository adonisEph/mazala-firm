-- Mazala Firm — CMS : contenu du site piloté depuis le back-office /admin.

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  techs TEXT NOT NULL DEFAULT '',          -- CSV : "React.js,Next.js,Node.js"
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role_fr TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  bio_fr TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Données initiales fidèles à la maquette ──
INSERT INTO projects (title, description_en, description_fr, techs, image_url, sort_order) VALUES
('See you', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'React.js,React.js,React.js', '', 1),
('See you', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'React.js,React.js,React.js', '', 2),
('See you', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eius minima veritatis eaque consectetur laborum.', 'React.js,React.js,React.js', '', 3);

INSERT INTO team_members (name, role_en, role_fr, bio_en, bio_fr, photo_url, linkedin, sort_order) VALUES
('Adonis DJIMBY', 'Mazala Co-Founder & CEO / Analyst-Programmer', 'Co-fondateur & CEO de Mazala / Analyste-programmeur',
 'Hello, my name is Adonis DJIMBY, Analyst-Programmer and CEO of Mazala. Welcome to the Mazala platform, we are delighted with your visit and are at your disposal. Looking forward to starting this great adventure with you. The pleasure of working with you',
 'Bonjour, je m''appelle Adonis DJIMBY, analyste-programmeur et CEO de Mazala. Bienvenue sur la plateforme Mazala — nous sommes ravis de votre visite et restons à votre disposition. Au plaisir de vivre cette belle aventure avec vous.',
 '/images/adonis.jpg', 'https://www.linkedin.com/in/adonis-djimby-b539a3167', 1),
('Inefable KOUMBA', 'Mazala Co-Founder / Analyst-Programmer', 'Co-fondateur de Mazala / Analyste-programmeur',
 'Hello, my name is Inefable KOUMBA. I''m a experienced software engineer and the Co-Founder of Mazala. I''m delighted to having you visiting our website. The Mazala team and myself included always work hard to provide you the best service possible. Looking forwards to work with you!',
 'Bonjour, je m''appelle Inefable KOUMBA, ingénieur logiciel expérimenté et co-fondateur de Mazala. Nous sommes ravis de votre visite — l''équipe Mazala et moi-même travaillons dur pour vous offrir le meilleur service possible. Au plaisir de collaborer avec vous !',
 '/images/kims.jpg', 'https://www.linkedin.com/in/inefablekoumba', 2);

-- Admin par défaut : adonis@mazala-firm.com / Mazala-Admin-2026! (PBKDF2 — à changer)
INSERT INTO admin_users (email, password_hash, name) VALUES
('adonis@mazala-firm.com', 'pbkdf2:a50ade3336354090f36f21efd1c51a50:5a812735ea6facb21c9811047c4a9b0be5a61e6f752fb1003d322a366a630a8b', 'Adonis DJIMBY');
