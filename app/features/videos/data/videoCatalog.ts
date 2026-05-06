export type VideoItem = {
  id: string;
  moduleCode: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl?: string;
  videoUrl: string | number;
  instructor?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
};

const DEFAULT_VIDEO_URL = require("./video.mp4");

export const VIDEO_CATALOG: VideoItem[] = [
  // Module: Fondamentaux (FOND)
  {
    id: "VID001",
    moduleCode: "FOND",
    title: "Introduction à la Cybersécurité",
    description:
      "Découvrez les concepts fondamentaux de la cybersécurité et les menaces courantes.",
    duration: "15 min",
    instructor: "Dr. Jean Dupont",
    difficulty: "beginner",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID002",
    moduleCode: "FOND",
    title: "Les Types de Ménaces Informatiques",
    description: "Apprenez à identifier les différents types d'attaques.",
    duration: "12 min",
    instructor: "Marie Lemoine",
    difficulty: "beginner",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID003",
    moduleCode: "FOND",
    title: "Pratiques Essentielles de Sécurité",
    description:
      "Les meilleures pratiques pour protéger vos données et comptes.",
    duration: "18 min",
    instructor: "Dr. Jean Dupont",
    difficulty: "beginner",
    videoUrl: DEFAULT_VIDEO_URL,
  },

  // Module: Identification (IDENT)
  {
    id: "VID004",
    moduleCode: "IDENT",
    title: "Authentification et Identification",
    description: "Comprendre les mécanismes d'authentification modernes.",
    duration: "14 min",
    instructor: "Pierre Martin",
    difficulty: "intermediate",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID005",
    moduleCode: "IDENT",
    title: "Gestion des Mots de Passe",
    description: "Comment créer et gérer des mots de passe forts et sécurisés.",
    duration: "10 min",
    instructor: "Sophie Bernard",
    difficulty: "beginner",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID006",
    moduleCode: "IDENT",
    title: "Authentification Multi-Facteur",
    description: "Sécuriser vos comptes avec l'authentification multi-facteur.",
    duration: "16 min",
    instructor: "Pierre Martin",
    difficulty: "intermediate",
    videoUrl: DEFAULT_VIDEO_URL,
  },

  // Module: Protection des Données (PROT)
  {
    id: "VID007",
    moduleCode: "PROT",
    title: "Chiffrement des Données",
    description:
      "Découvrez les techniques de chiffrement pour protéger vos données.",
    duration: "20 min",
    instructor: "Dr. Jean Dupont",
    difficulty: "intermediate",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID008",
    moduleCode: "PROT",
    title: "Sauvegardes Sécurisées",
    description: "Mettre en place une stratégie de sauvegarde efficace.",
    duration: "13 min",
    instructor: "Thomas Leclerc",
    difficulty: "beginner",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID009",
    moduleCode: "PROT",
    title: "Protection contre les Malwares",
    description: "Comprendre et prévenir les infections par malwares et virus.",
    duration: "17 min",
    instructor: "Sophie Bernard",
    difficulty: "intermediate",
    videoUrl: DEFAULT_VIDEO_URL,
  },

  // Module: Pare-feu (FIREWALL)
  {
    id: "VID010",
    moduleCode: "FIREWALL",
    title: "Fondamentaux des Pare-feu",
    description: "Introduction aux pare-feu et leur importance.",
    duration: "16 min",
    instructor: "Pierre Martin",
    difficulty: "intermediate",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID011",
    moduleCode: "FIREWALL",
    title: "Configuration d'un Pare-feu",
    description: "Configurer et maintenir un pare-feu efficace.",
    duration: "22 min",
    instructor: "Thomas Leclerc",
    difficulty: "advanced",
    videoUrl: DEFAULT_VIDEO_URL,
  },
  {
    id: "VID012",
    moduleCode: "FIREWALL",
    title: "Filtrage des Paquets Réseau",
    description: "Comprendre et mettre en œuvre le filtrage de paquets.",
    duration: "19 min",
    instructor: "Dr. Jean Dupont",
    difficulty: "advanced",
    videoUrl: DEFAULT_VIDEO_URL,
  },
];

export function getVideosByModule(moduleCode: string): VideoItem[] {
  return VIDEO_CATALOG.filter((video) => video.moduleCode === moduleCode).sort(
    (a, b) => a.title.localeCompare(b.title),
  );
}

export function getAllModulesWithVideos(): Array<{
  code: string;
  title: string;
  videoCount: number;
}> {
  const moduleMap = new Map<string, { code: string; title: string }>();

  // Map module codes to titles
  const moduleTitles: Record<string, string> = {
    FOND: "Fondamentaux",
    IDENT: "Identification",
    PROT: "Protection des Données",
    FIREWALL: "Pare-feu",
  };

  VIDEO_CATALOG.forEach((video) => {
    if (!moduleMap.has(video.moduleCode)) {
      moduleMap.set(video.moduleCode, {
        code: video.moduleCode,
        title: moduleTitles[video.moduleCode] || video.moduleCode,
      });
    }
  });

  return Array.from(moduleMap.values())
    .map((module) => ({
      ...module,
      videoCount: getVideosByModule(module.code).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
