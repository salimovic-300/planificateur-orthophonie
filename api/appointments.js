import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const STORAGE_KEY = 'appointments-data';

  try {
    if (req.method === 'GET') {
      // Récupérer les rendez-vous
      const data = await kv.get(STORAGE_KEY);
      console.log('GET appointments:', data);
      res.status(200).json({ appointments: data || {} });
    } 
    else if (req.method === 'POST') {
      // Sauvegarder les rendez-vous
      const { appointments } = req.body;
      console.log('Saving appointments:', appointments);
      await kv.set(STORAGE_KEY, appointments);
      res.status(200).json({ success: true, message: 'Données sauvegardées' });
    } 
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('KV Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}