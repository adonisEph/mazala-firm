export interface SiteTheme {
  id: string; // valeur de data-theme (« mazala » = défaut, attribut retiré)
  label: string;
  sw: [string, string]; // pastilles [section foncée, accent] dans le sélecteur
}

// Palettes pro, contrastées : valeurs complètes définies dans globals.css.
export const THEMES: SiteTheme[] = [
  { id: "mazala", label: "Mazala", sw: ["#4A4860", "#CC8800"] },
  { id: "marine", label: "Marine", sw: ["#1E3A5F", "#D97706"] },
  { id: "emeraude", label: "Émeraude", sw: ["#1A4233", "#B8860B"] },
  { id: "bordeaux", label: "Bordeaux", sw: ["#4B2434", "#C0782A"] },
  { id: "nuit", label: "Nuit", sw: ["#1E2430", "#D9A406"] },
  { id: "safran", label: "Safran", sw: ["#4A3E32", "#C86414"] },
];

export const THEME_STORAGE_KEY = "mz-theme";
export const DEFAULT_THEME_ID = "marine";
