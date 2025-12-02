import { MongoClient, ObjectId } from 'mongodb'; // <-- Importez ObjectId ici

// ... (connectToDatabase reste le même)

// Export pour Vercel Serverless Functions
export default async function handler(req, res) {
  // ... (CORS et OPTIONS restent les mêmes)

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(MONGODB_COLLECTION_NAME);

    // ... (GET reste le même)

    // ... (POST reste le même - attention, le POST actuel écrase tout)
    
    // PUT - Mettre à jour un rendez-vous spécifique
    if (req.method === 'PUT') {
      const { id, appointment } = req.body;
      
      // ... (vérifications restent les mêmes)

      console.log('📝 PUT - Mise à jour du rendez-vous:', id);
      
      // CONVERSION IMPORTANTE : Utilisez ObjectId(id) si l'ID est un ObjectId de MongoDB
      await collection.updateOne(
        { _id: new ObjectId(id) }, // <--- CHANGEMENT ICI
        { $set: appointment },
        { upsert: true }
      );
      
      console.log('✅ Rendez-vous mis à jour');
      return res.status(200).json({ success: true });
    }

    // DELETE - Supprimer un rendez-vous spécifique
    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      // ... (vérifications restent les mêmes)

      console.log('🗑️ DELETE - Suppression du rendez-vous:', id);
      
      // CONVERSION IMPORTANTE : Utilisez ObjectId(id)
      await collection.deleteOne({ _id: new ObjectId(id) }); // <--- CHANGEMENT ICI
      
      console.log('✅ Rendez-vous supprimé');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    // ... (gestion des erreurs reste la même)
  }
}