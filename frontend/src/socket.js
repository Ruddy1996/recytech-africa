// src/socket.js
import { io } from "socket.io-client";

// 🔧 Récupère l’URL du backend API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// On enlève /api (même avec un slash final) pour obtenir l’URL WebSocket
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket = null;

export function initSocket() {
  if (!socket) {
    console.log("⚡ Connexion Socket vers :", SOCKET_URL);

    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"], // fallback important pour Railway
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket global connecté :", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket global déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur connexion socket :", err.message);
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}
