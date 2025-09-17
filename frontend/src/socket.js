import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export function initSocket() {
  if (!socket) {
    console.log("⚡ Tentative de connexion socket...");

    socket = io(SOCKET_URL, {
      autoConnect: true,         // connecte automatiquement
      transports: ["websocket","polling"], // fallback sur polling si ws échoue
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket global connecté :", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket global déconnecté :", reason);
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export default socket;
