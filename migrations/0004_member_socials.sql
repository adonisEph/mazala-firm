-- Réseaux sociaux multiples par membre : JSON [{ "type": "linkedin", "url": "…" }]
-- Les LinkedIn existants sont migrés dans socials, puis la colonne est supprimée.

ALTER TABLE team_members ADD COLUMN socials TEXT NOT NULL DEFAULT '[]';

UPDATE team_members
SET socials = json_array(json_object('type', 'linkedin', 'url', linkedin))
WHERE linkedin IS NOT NULL AND linkedin != '';

ALTER TABLE team_members DROP COLUMN linkedin;
