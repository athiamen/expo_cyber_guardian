/* eslint-disable no-console */

const path = require("path");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccountPath = path.join(__dirname, "firebase-key.json");

function resolveServiceAccount() {
  const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawEnv) {
    try {
      return JSON.parse(rawEnv);
    } catch {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
      process.exit(1);
    }
  }

  try {
    // Keep CommonJS require for JSON loading in plain Node.
    return require(serviceAccountPath);
  } catch {
    console.error(
      "Missing scripts/firebase-key.json. Add a Firebase service account key at scripts/firebase-key.json or set FIREBASE_SERVICE_ACCOUNT_JSON.",
    );
    process.exit(1);
  }
}

const serviceAccount = resolveServiceAccount();

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const MODULES = [
  {
    code: "MOD1",
    title: "Cyber Héros",
    level: "beginner",
    progress: 0,
    description: "Réflexes essentiels pour mots de passe et phishing.",
  },
  {
    code: "MOD2",
    title: "Protection des comptes",
    level: "beginner",
    progress: 0,
    description:
      "Construire des identifiants robustes et limiter les risques de compromission.",
  },
  {
    code: "MOD3",
    title: "Messagerie sécurisée",
    level: "intermediate",
    progress: 0,
    description:
      "Identifier les signaux d'arnaque et adopter les bons réflexes en chat.",
  },
];

const COURSES = [
  {
    code: "C1",
    moduleCode: "MOD1",
    title: "Créer des mots de passe solides",
    duration: "12 min",
    format: "lecture",
    objective:
      "Utiliser des mots de passe uniques, longs et difficiles à deviner.",
  },
  {
    code: "C2",
    moduleCode: "MOD1",
    title: "Reconnaître les messages de phishing",
    duration: "10 min",
    format: "lecture",
    objective: "Vérifier la source et les liens avant toute action.",
  },
  {
    code: "C3",
    moduleCode: "MOD1",
    title: "Composer une phrase de passe",
    duration: "9 min",
    format: "atelier",
    objective: "Transformer une phrase mémoire en identifiant robuste.",
  },
  {
    code: "C4",
    moduleCode: "MOD2",
    title: "Activer la double vérification",
    duration: "8 min",
    format: "atelier",
    objective:
      "Ajouter une seconde barrière de sécurité sur les comptes sensibles.",
  },
  {
    code: "C5",
    moduleCode: "MOD2",
    title: "Analyser une conversation suspecte",
    duration: "11 min",
    format: "scénario",
    objective:
      "Identifier urgence artificielle, menace et manipulation émotionnelle.",
  },
  {
    code: "C6",
    moduleCode: "MOD2",
    title: "Classer les données personnelles",
    duration: "10 min",
    format: "atelier",
    objective: "Distinguer données publiques, privées et sensibles.",
  },
  {
    code: "C7",
    moduleCode: "MOD3",
    title: "Reconnaître les tentatives de manipulation",
    duration: "10 min",
    format: "lecture",
    objective: "Identifier les signaux émotionnels utilisés dans les arnaques.",
  },
  {
    code: "C8",
    moduleCode: "MOD3",
    title: "Défendre ses données en temps réel",
    duration: "13 min",
    format: "simulation",
    objective:
      "Réagir rapidement face aux menaces et protéger les informations sensibles.",
  },
  {
    code: "C9",
    moduleCode: "MOD3",
    title: "Vérifier l'authenticité des demandes",
    duration: "9 min",
    format: "atelier",
    objective: "Valider l'identité avant de communiquer des données.",
  },
];

const QUIZZES = [
  {
    code: "Q1",
    moduleCode: "MOD1",
    title: "Maître des Mots de Passe",
    duration: "6 min",
    difficulty: "medium",
    questions: [
      {
        id: "Q1-1",
        text: "Quel mot de passe est le plus solide ?",
        options: ["123456", "MotDePasse", "LicorneMagique2024!"],
        correctIndex: 2,
      },
      {
        id: "Q1-2",
        text: "Quelle habitude est la plus sûre ?",
        options: [
          "Partager son mot de passe",
          "Utiliser un mot de passe différent pour chaque site",
          "Réutiliser le même partout",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    code: "Q2",
    moduleCode: "MOD1",
    title: "Détecteur de Pièges",
    duration: "6 min",
    difficulty: "medium",
    questions: [
      {
        id: "Q2-1",
        text: "Quel email semble suspect ?",
        options: [
          "Message sans lien et sans urgence",
          "Adresse inconnue avec urgence exagérée",
          "Message déjà attendu",
        ],
        correctIndex: 1,
      },
      {
        id: "Q2-2",
        text: "Que faut-il vérifier en premier ?",
        options: [
          "Le fond d'écran",
          "L'adresse de l'expéditeur",
          "La couleur du texte",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    code: "Q3",
    moduleCode: "MOD2",
    title: "Le Royaume des Mots de Passe",
    duration: "5 min",
    difficulty: "easy",
    questions: [
      {
        id: "Q3-1",
        text: "Quel premier choix aide à fabriquer un mot de passe solide ?",
        options: [
          "Un animal totem",
          "Le nom du professeur",
          "Le mot de passe du voisin",
        ],
        correctIndex: 0,
      },
      {
        id: "Q3-2",
        text: "Quel symbole complète efficacement un mot de passe ?",
        options: ["!", "a", "3"],
        correctIndex: 0,
      },
    ],
  },
  {
    code: "Q4",
    moduleCode: "MOD2",
    title: "Chat Guardian",
    duration: "7 min",
    difficulty: "medium",
    questions: [
      {
        id: "Q4-1",
        text: "Un faux concours demande ton code SMS bancaire. Que fais-tu ?",
        options: [
          "Bloquer le contact",
          "Signaler à la plateforme",
          "Partager en DM",
        ],
        correctIndex: 1,
      },
      {
        id: "Q4-2",
        text: "Un inconnu insiste pour avoir ton numéro personnel. Réaction ?",
        options: ["Bloquer le contact", "Partager le numéro", "Répondre vite"],
        correctIndex: 0,
      },
    ],
  },
  {
    code: "Q5",
    moduleCode: "MOD3",
    title: "Le Labyrinthe des Infos",
    duration: "6 min",
    difficulty: "easy",
    questions: [
      {
        id: "Q5-1",
        text: "Quelle donnée faut-il protéger dans ce jeu ?",
        options: [
          "Adresse et numéro de téléphone",
          "Couleur préférée seulement",
          "Nom d'un dessin animé",
        ],
        correctIndex: 0,
      },
      {
        id: "Q5-2",
        text: "Combien de vies le joueur a-t-il au départ ?",
        options: ["2", "5", "10"],
        correctIndex: 1,
      },
    ],
  },
  {
    code: "Q6",
    moduleCode: "MOD3",
    title: "Firewall Defender",
    duration: "8 min",
    difficulty: "hard",
    questions: [
      {
        id: "Q6-1",
        text: "Quel est le rôle du joueur dans Firewall Defender ?",
        options: [
          "Programmer un serveur DNS",
          "Déplacer un coffre pour protéger les données",
          "Configurer un VPN entreprise",
        ],
        correctIndex: 1,
      },
      {
        id: "Q6-2",
        text: "Que se passe-t-il si une menace touche les données ?",
        options: [
          "Le score est doublé",
          "Le niveau suivant se débloque",
          "Le bouclier diminue",
        ],
        correctIndex: 2,
      },
    ],
  },
];

async function upsertCollection(collectionName, rows) {
  for (const row of rows) {
    await db.collection(collectionName).doc(row.code).set(row, { merge: true });
    console.log(`OK ${collectionName}/${row.code}`);
  }
}

async function seedData() {
  console.log("Seeding Firestore collections modules/courses/quizzes...");

  await upsertCollection("modules", MODULES);
  await upsertCollection("courses", COURSES);
  await upsertCollection("quizzes", QUIZZES);

  console.log("Seed complete.");
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
