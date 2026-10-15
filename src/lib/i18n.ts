export type Lang = "fr" | "en";

export const T = {
  en: {
    nav: { services: "Services", portfolio: "Portfolio", team: "Our team", about: "About Us", contact: "CONTACT" },
    hero: {
      line1a: "WE MAKE APPS FOR",
      mobile: "MOBILE",
      web: "WEB",
      and: "&",
      desktop: "DESKTOP",
      line2: "using latest technologies and best practises",
      flipFront: "let's go",
      flipBack: "Nice choice",
    },
    services: {
      title: "What do we do ?",
      subtitle: "Still, we have more stuffs under our belt",
      items: [
        { title: "UI & UX Design", desc: "We create beautiful and intuitive graphic interfaces to provide users the best experience possible" },
        { title: "Web Development", desc: "The web is everywhere right now, let us bring to life the website of your dream. We create all kind of websites" },
        { title: "Mobile Development", desc: "Mobile Apps are revolutionning the way we make businesses. Let us take care of it for you and relax!" },
      ],
    },
    portfolio: {
      title: "Some of our projects",
      subtitle: "Bellow are some of the latest projects we have made, check it out !",
      viewAll: "VIEW ALL PROJECTS",
    },
    team: {
      title: "Meet the team",
    },
    contact: {
      title: "Let's get in touch",
      subtitle: "Feel free to leave us a message, will get back to you very soon!",
      email: "contact@mazala.com",
      orForm: "Or fill up the form bellow",
      namePh: "Your name / Compagny name",
      emailPh: "Your email address",
      messagePh: "Your message",
      submit: "SUBMIT",
      sending: "Sending…",
      sent: "Message sent — we'll get back to you soon!",
      error: "Something went wrong, please retry.",
      fileLabel: "Attachment",
    },
    footer: {
      location: "Brazzaville, Republic Of Congo",
      policies: "Policies",
      copyright: "© 2021 Mazala. All Rights Reserved",
    },
    about: {
      title: "About Us",
      body: "Born from the collaboration between two Analyst-Programmers, Mazala is a software engineering firm created in 2020 by James Adonis DJIMBY and KOUMBA Surprise Inefable, and has been present on the new technologies market since then.\n\nMazala is based in UI & UX Design, Web Development, Mobile App Development, Robotics, Artificial Intelligence.\n\nWe also support Start-Ups and Companies in their computerization projects for their information system, as well as in their innovative ideas for a better experience of digitizing their needs and tasks. We set ourselves the goal of computerizing and digitizing all manual data processing systems for companies as well as the various needs or ideas of individuals that we will have the privilege of managing in order to guarantee a better experience of the digital age as well as simplicity, and reliability in the processing of data and the performance of various tasks.\n\nWe are diligent, passionate, and determined to provide you with quality work on time. We remain available to meet you in order to start this great adventure together.",
    },
  },
  fr: {
    nav: { services: "Services", portfolio: "Réalisations", team: "Équipe", about: "À propos", contact: "CONTACT" },
    hero: {
      line1a: "NOUS CRÉONS DES APPLIS",
      mobile: "MOBILE",
      web: "WEB",
      and: "&",
      desktop: "DESKTOP",
      line2: "avec les dernières technologies et les meilleures pratiques",
      flipFront: "c'est parti",
      flipBack: "Bon choix",
    },
    services: {
      title: "Que faisons-nous ?",
      subtitle: "Et nous avons encore bien d'autres cordes à notre arc",
      items: [
        { title: "UI & UX Design", desc: "Nous créons des interfaces graphiques belles et intuitives pour offrir aux utilisateurs la meilleure expérience possible" },
        { title: "Développement Web", desc: "Le web est partout — laissez-nous donner vie au site de vos rêves. Nous créons tous types de sites" },
        { title: "Développement Mobile", desc: "Restez proches de vos utilisateurs — nous construisons des apps mobiles rapides et fiables pour Android et iOS" },
      ],
    },
    portfolio: {
      title: "Quelques-uns de nos projets",
      subtitle: "Voici quelques-uns de nos derniers projets — jetez-y un œil !",
      viewAll: "TOUS LES PROJETS",
    },
    team: {
      title: "Notre équipe",
    },
    contact: {
      title: "Discutons ensemble",
      subtitle: "Laissez-nous un message, nous vous répondrons très vite !",
      email: "contact@mazala.com",
      orForm: "Ou remplissez le formulaire ci-dessous",
      namePh: "Votre nom / Nom de l'entreprise",
      emailPh: "Votre adresse email",
      messagePh: "Votre message",
      submit: "ENVOYER",
      sending: "Envoi…",
      sent: "Message envoyé — nous revenons vers vous très vite !",
      error: "Une erreur est survenue, réessayez.",
      fileLabel: "Pièce jointe",
    },
    footer: {
      location: "Brazzaville, République du Congo",
      policies: "Politiques",
      copyright: "© 2021 Mazala. Tous droits réservés",
    },
    about: {
      title: "À propos",
      body: "Née de la collaboration de deux analystes-programmeurs, Mazala est un cabinet de génie logiciel créé en 2020 par James Adonis DJIMBY et KOUMBA Surprise Inefable, présent depuis sur le marché des nouvelles technologies.\n\nMazala s'appuie sur l'UI & UX Design, le développement web, le développement d'applications mobiles, la robotique et l'intelligence artificielle.\n\nNous accompagnons également les start-ups et entreprises dans leurs projets d'informatisation de leur système d'information, ainsi que dans leurs idées innovantes pour une meilleure expérience de digitalisation de leurs besoins et tâches. Nous nous fixons pour objectif d'informatiser et de digitaliser tous les systèmes de traitement manuel de données des entreprises, ainsi que les besoins ou idées des particuliers que nous aurons le privilège de gérer, afin de garantir une meilleure expérience de l'ère numérique, la simplicité et la fiabilité du traitement des données et la performance des tâches.\n\nNous sommes rigoureux, passionnés et déterminés à vous livrer un travail de qualité dans les délais. Nous restons disponibles pour vous rencontrer et commencer cette belle aventure ensemble.",
    },
  },
} as const;
