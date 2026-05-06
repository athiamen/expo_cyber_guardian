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

async function deleteAllCollections() {
  // Top-level collections to clear
  const collections = ["modules", "courses", "quizzes", "users"];

  for (const col of collections) {
    try {
      const docs = await db.collection(col).listDocuments();
      if (!docs || docs.length === 0) {
        console.log(`No documents found in collection: ${col}`);
        continue;
      }

      console.log(`Deleting ${docs.length} documents from collection: ${col}`);
      await Promise.all(docs.map((d) => d.delete()));
      console.log(`Cleared collection: ${col}`);
    } catch (err) {
      console.error(`Failed to clear collection ${col}:`, err);
    }
  }

  console.log("All requested collections processed.");
}

deleteAllCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deletion failed:", error);
    process.exit(1);
  });
