import { Redis } from '@upstash/redis'

// Initialiser le client Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Fonction pour sauvegarder les rendez-vous
export async function saveAppointments(userId, appointments) {
  const key = `appointments:${userId}`
  await redis.set(key, JSON.stringify(appointments))
  return { success: true }
}

// Fonction pour récupérer les rendez-vous
export async function getAppointments(userId) {
  const key = `appointments:${userId}`
  const data = await redis.get(key)
  
  if (!data) {
    return []
  }
  
  // Si c'est déjà un objet (Redis peut le parser automatiquement)
  if (typeof data === 'object') {
    return data
  }
  
  // Sinon, parser le JSON
  return JSON.parse(data)
}

// Fonction pour supprimer un rendez-vous
export async function deleteAppointment(userId, appointmentId) {
  const appointments = await getAppointments(userId)
  const filtered = appointments.filter(apt => apt.id !== appointmentId)
  await saveAppointments(userId, filtered)
  return { success: true }
}

// Fonction pour mettre à jour un rendez-vous
export async function updateAppointment(userId, appointmentId, updatedData) {
  const appointments = await getAppointments(userId)
  const index = appointments.findIndex(apt => apt.id === appointmentId)
  
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updatedData }
    await saveAppointments(userId, appointments)
    return { success: true, appointment: appointments[index] }
  }
  
  return { success: false, error: 'Appointment not found' }
}

export default redis