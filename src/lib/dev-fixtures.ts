import type { CmsMember, CmsProject } from "@/components/MazalaPage";

// Fixtures de secours : renvoyées uniquement en `next dev` si la D1 locale
// est injoignable (pas de .wrangler/state). Jamais en production.
export const DEV_PROJECTS: CmsProject[] = [
  {
    id: 1,
    title: "See you",
    description_fr: "Application de prise de rendez-vous et de gestion de planning pour les professionnels — notifications, rappels et synchronisation calendrier.",
    description_en: "Appointment scheduling and planning app for professionals — notifications, reminders and calendar sync.",
    techs: "Next.js, TypeScript, Tailwind, D1",
    image_url: "/images/ui-design.svg",
    project_url: "https://seeyou.example.com",
    platform: "web",
  },
  {
    id: 2,
    title: "Mazala Shop",
    description_fr: "Boutique mobile avec paiement intégré, catalogue produit et suivi de commandes en temps réel.",
    description_en: "Mobile shop with integrated payments, product catalog and real-time order tracking.",
    techs: "React Native, Stripe, Fastify",
    image_url: "",
    project_url: "",
    platform: "mobile",
  },
  {
    id: 3,
    title: "Deskboard",
    description_fr: "Tableau de bord desktop pour la supervision de parc machines — métriques, alertes et rapports.",
    description_en: "Desktop dashboard for machine fleet monitoring — metrics, alerts and reports.",
    techs: "Electron, React, SQLite",
    image_url: "",
    project_url: "https://deskboard.example.com",
    platform: "desktop",
  },
  {
    id: 4,
    title: "Intranet Portal",
    description_fr: "Portail intranet d'entreprise : annuaire, documents, congés et tickets d'assistance.",
    description_en: "Company intranet portal: directory, documents, leave requests and support tickets.",
    techs: "Next.js, PostgreSQL, Keycloak, Docker, Nginx",
    image_url: "",
    project_url: "",
    platform: "web",
  },
];

export const DEV_MEMBERS: CmsMember[] = [
  {
    id: 1,
    name: "Adonis DJIMBY",
    role_fr: "Co-fondateur & CEO de Mazala / Analyste-programmeur",
    role_en: "Mazala Co-Founder & CEO / Analyst-Programmer",
    bio_fr: "Bonjour, je m'appelle Adonis DJIMBY, analyste-programmeur et CEO de Mazala. Bienvenue sur la plateforme Mazala — nous sommes ravis de votre visite et restons à votre disposition.",
    bio_en: "Hello, my name is Adonis DJIMBY, Analyst-Programmer and CEO of Mazala. Welcome to the Mazala platform, we are delighted with your visit and are at your disposal.",
    photo_url: "/images/adonis.jpg",
    socials: JSON.stringify([
      { type: "linkedin", url: "https://www.linkedin.com/in/adonis-djimby-b539a3167" },
      { type: "github", url: "https://github.com/adonisEph" },
    ]),
  },
  {
    id: 2,
    name: "Inefable KOUMBA",
    role_fr: "Co-fondateur de Mazala / Analyste-programmeur",
    role_en: "Mazala Co-Founder / Analyst-Programmer",
    bio_fr: "Bonjour, je m'appelle Inefable KOUMBA, ingénieur logiciel expérimenté et co-fondateur de Mazala. Nous sommes ravis de votre visite.",
    bio_en: "Hello, my name is Inefable KOUMBA. I'm a experienced software engineer and the Co-Founder of Mazala. I'm delighted to having you visiting our website.",
    photo_url: "/images/kims.jpg",
    socials: JSON.stringify([
      { type: "linkedin", url: "https://www.linkedin.com/in/inefablekoumba" },
      { type: "x", url: "https://x.com" },
      { type: "website", url: "https://mazala-firm.com" },
    ]),
  },
];
