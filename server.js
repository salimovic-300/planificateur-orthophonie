import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

console.log(
  "🔍 MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Défini" : "❌ Manquant"
);

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME || "planificateur_orthophonie";
const MONGODB_COLLECTION_NAME =
  process.env.MONGODB_COLLECTION_NAME || "appointments";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI n'est pas défini!");
  process.exit(1);
}

let db;
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log("✅ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
}

app.get("/api/appointments", async (req, res) => {
  try {
    const collection = db.collection(MONGODB_COLLECTION_NAME);
    const doc = await collection.findOne({ _id: "appointments" });
    res.json(doc ? doc.data || {} : {});
  } catch (error) {
    console.error("❌ Erreur GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const { appointments } = req.body;
    const collection = db.collection(MONGODB_COLLECTION_NAME);
    const result = await collection.updateOne(
      { _id: "appointments" },
      { $set: { data: appointments, lastUpdated: new Date() } },
      { upsert: true }
    );
    res.json({ message: "✅ Sauvegardé", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("❌ Erreur POST:", error);
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${PORT}`);
  });
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt...");
  await client.close();
  process.exit(0);
});
