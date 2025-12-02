import { MongoClient } from 'mongodb';

// Variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'planificateur_orthophonie';
const MONGODB_COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'appointments';

let cachedClient = null;
let cachedDb = null;

// Fonction pour se connecter à MongoDB (avec cache pour Vercel)
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('✅ Utilisation de la connexion MongoDB en cache');
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI n\'est pas défini dans les variables d\'environnement');
  }

  console.log('🔌 Connexion à MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(MONGODB_DB_NAME);
  
  cachedClient = client;
  cachedDb = db;
  
  console.log('✅ Connecté à MongoDB');
  return { client, db };
}

// Export pour Vercel Serverless Functions
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(MONGODB_COLLECTION_NAME);

    // GET - Récupérer tous les rendez-vous
    if (req.method === 'GET') {
      console.log('📖 GET - Lecture depuis MongoDB...');
      
      const appointments = await collection.find({}).toArray();
      
      // Convertir le tableau en objet avec les IDs comme clés
      const appointmentsObject = {};
      appointments.forEach(apt => {
        const id = apt._id.toString();
        delete apt._id; // Enlever _id de MongoDB
        appointmentsObject[id] = apt;
      });
      
      console.log(`✅ ${appointments.length} rendez-vous trouvés`);
      return res.status(200).json(appointmentsObject);
    }

    // POST - Sauvegarder tous les rendez-vous (écrase tout)
    if (req.method === 'POST') {
      const { appointments } = req.body;
      
      if (!appointments) {
        return res.status(400).json({ error: 'Missing appointments data' });
      }

      console.log('💾 POST - Sauvegarde dans MongoDB...', Object.keys(appointments).length, 'rendez-vous');
      
      // Supprimer tous les rendez-vous existants
      await collection.deleteMany({});
      
      // Insérer les nouveaux rendez-vous
      if (Object.keys(appointments).length > 0) {
        const appointmentsArray = Object.entries(appointments).map(([id, data]) => ({
          _id: id,
          ...data
        }));
        
        await collection.insertMany(appointmentsArray);
      }
      
      console.log('✅ Données sauvegardées avec succès');
      return res.status(200).json({ success: true });
    }

    // PUT - Mettre à jour un rendez-vous spécifique
    if (req.method === 'PUT') {
      const { id, appointment } = req.body;
      
      if (!id || !appointment) {
        return res.status(400).json({ error: 'Missing id or appointment data' });
      }

      console.log('📝 PUT - Mise à jour du rendez-vous:', id);
      
      await collection.updateOne(
        { _id: id },
        { $set: appointment },
        { upsert: true }
      );
      
      console.log('✅ Rendez-vous mis à jour');
      return res.status(200).json({ success: true });
    }

    // DELETE - Supprimer un rendez-vous spécifique
    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      console.log('🗑️ DELETE - Suppression du rendez-vous:', id);
      
      await collection.deleteOne({ _id: id });
      
      console.log('✅ Rendez-vous supprimé');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}