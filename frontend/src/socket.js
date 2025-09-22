// src/socket.js
import { io } from "socket.io-client";

// 🔧 On récupère l’URL du backend depuis .env
// Exemple: VITE_API_URL=https://recytech-africa-production.up.railway.app/api
// → On enlève "/api" pour obtenir l’URL du serveur WebSocket
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace("/api", "");

let socket = null;

export function initSocket() {
  if (!socket) {
    console.log("⚡ Tentative de connexion socket vers :", SOCKET_URL);

    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"], // fallback sur polling si ws échoue
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket global connecté :", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket global déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion socket :", err.message);
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export default socket;
