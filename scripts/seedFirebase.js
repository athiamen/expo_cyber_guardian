// ⚠️ À exécuter une seule fois : npm run seed:firebase
// Remplacer les valeurs avant d'exécuter

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Télécharger votre clé privée Firebase depuis Paramètres → Comptes de service
const serviceAccount = require("./firebase-key.json");

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function seedData() {
  console.log("Seeding Firestore...");

  // 1. Modules
  const modules = {
    MOD1: {
      title: "Hygiène numérique",
      description: "Les bases de la sécurité informatique",
      courses: ["C1", "C2", "C3"],
      quizzes: ["Q1", "Q2"],
    },
    MOD2: {
      title: "Phishing et social engineering",
      description: "Reconnaître les tentatives de fraude",
      courses: ["C4", "C5"],
      quizzes: ["Q3"],
    },
  };

  for (const [code, data] of Object.entries(modules)) {
    await db.collection("modules").doc(code).set(data);
    console.log(`✓ Module ${code}`);
  }

  // 2. Courses
  const courses = {
    C1: {
      title: "Gestion des mots de passe",
      moduleCode: "MOD1",
      objective: "Comprendre l'importance des mots de passe forts",
      videoUrl: "https://media.w3schools.com/video.mp4",
    },
    C2: {
      title: "Authentification à 2 facteurs",
      moduleCode: "MOD1",
      objective: "Activer 2FA sur vos comptes",
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    },
  };

  for (const [code, data] of Object.entries(courses)) {
    await db.collection("courses").doc(code).set(data);
    console.log(`✓ Course ${code}`);
  }

  // 3. Quizzes
  const quizzes = {
    Q1: {
      title: "Quiz Hygiène numérique",
      moduleCode: "MOD1",
      difficulty: "medium",
      questions: [
        {
          text: "Quel est le critère d'un bon mot de passe?",
          options: [
            "Au moins 8 caractères",
            "Mélange majuscules/minuscules/chiffres/symboles",
            "Les deux",
            "Aucun critère",
          ],
          correctIndex: 2,
        },
      ],
    },
  };

  for (const [code, data] of Object.entries(quizzes)) {
    await db.collection("quizzes").doc(code).set(data);
    console.log(`✓ Quiz ${code}`);
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
