// pages/api/appointments.js (pour Next.js 12 ou moins)
// ou app/api/appointments/route.js (pour Next.js 13+)

import { saveAppointments, getAppointments } from "@/lib/kv";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('📥 Récupération des rendez-vous...');
      const appointments = await getAppointments();
      res.status(200).json({ appointments });
    } catch (error) {
      console.error('❌ Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      console.log('💾 Sauvegarde des rendez-vous...');
      const { appointments } = req.body;
      await saveAppointments(appointments);
      res.status(200).json({ success: true, message: 'Données sauvegardées' });
    } catch (error) {
      console.error('❌ Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
    }
  } 
  else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}