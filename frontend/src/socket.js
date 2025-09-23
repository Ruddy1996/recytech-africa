// src/socket.js
import { io } from "socket.io-client";

// 🔧 Récupération de l’URL API depuis .env
// Exemple : VITE_API_URL=https://recytech-africa-production.up.railway.app/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// On enlève /api pour obtenir le domaine principal du serveur
const SOCKET_URL = API_URL.replace("/api", "");

let socket = null;

/**
 * Initialise le socket.io
 */
export function initSocket() {
  if (!socket) {
    console.log("⚡ Connexion Socket.io vers :", SOCKET_URL);

    socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"], // websocket si possible, sinon polling
      withCredentials: true,
      secure: SOCKET_URL.startsWith("https"), // true pour HTTPS
    });

    socket.on("connect", () => {
      console.log("✅ Socket global connecté :", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔴 Socket global déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion Socket :", err.message);
    });
  }

  return socket;
}

/**
 * Récupère l'instance existante
 */
export function getSocket() {
  return socket;
}

export default socket;
