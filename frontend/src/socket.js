import { io } from "socket.io-client";

// 🔧 Récupère l’URL du backend depuis l'env
// Exemple VITE_API_URL=https://recytech-africa-production.up.railway.app/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// On enlève "/api" pour obtenir l’URL du serveur Socket
const SOCKET_URL = API_URL.replace("/api", "");

let socket = null;

export function initSocket() {
  if (!socket) {
    console.log("⚡ Connexion Socket.io vers :", SOCKET_URL);

    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket global connecté :", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket global déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion Socket :", err.message);
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export default socket;
