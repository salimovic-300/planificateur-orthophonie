import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const APPOINTMENTS_KEY = 'appointments:main'

// Export pour Vercel Serverless Functions
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      console.log('📖 GET - Lecture depuis Redis...')
      const data = await redis.get(APPOINTMENTS_KEY)
      
      if (data) {
        console.log('✅ Données trouvées:', Object.keys(data).length, 'rendez-vous')
        return res.status(200).json(data)
      } else {
        console.log('ℹ️ Aucune donnée en base')
        return res.status(200).json({})
      }
    }

    if (req.method === 'POST') {
      const { appointments } = req.body
      
      console.log('💾 POST - Sauvegarde dans Redis...', Object.keys(appointments || {}).length, 'rendez-vous')
      
      if (!appointments) {
        return res.status(400).json({ error: 'Missing appointments data' })
      }

      await redis.set(APPOINTMENTS_KEY, appointments)
      console.log('✅ Données sauvegardées avec succès')
      
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('❌ Erreur API:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}