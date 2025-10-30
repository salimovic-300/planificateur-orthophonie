import { kv } from "@vercel/kv";

export async function saveAppointments(data) {
  try {
    await kv.set("appointments", JSON.stringify(data), { ex: 31536000 }); // Expire dans 1 an
    console.log("✅ Données sauvegardées dans KV");
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde :", error);
  }
}

export async function getAppointments() {
  try {
    const res = await kv.get("appointments");
    console.log("✅ Données récupérées depuis KV");
    return res ? JSON.parse(res) : {};
  } catch (error) {
    console.error("❌ Erreur lors de la récupération :", error);
    return {};
  }
}

export async function deleteAppointments() {
  try {
    await kv.del("appointments");
    console.log("✅ Données supprimées");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
  }
}