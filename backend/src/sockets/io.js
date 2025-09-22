// src/sockets/io.js
const { Server } = require("socket.io");

let io;

function setup(server) {
  if (io) return io; // éviter double setup

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(",") || ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client WebSocket connecté :", socket.id);

    // ⚡ Associer un utilisateur à un canal perso
    socket.on("registerUser", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`✅ Utilisateur ${userId} rejoint son canal perso`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion WebSocket :", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Client déconnecté :", socket.id, "| Raison:", reason);
    });
  });

  return io;
}

// Getter pour réutiliser l’instance io
function getIO() {
  if (!io) {
    console.warn("⚠️ Tentative d'utiliser Socket.io avant initialisation");
    return null;
  }
  return io;
}

// 🌍 Broadcast global
function sendToClients(event, data) {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.emit(event, data);
  }
}

// 👤 Émission ciblée à un utilisateur
function sendToUser(userId, event, data) {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`user_${userId}`).emit(event, data);
  }
}

module.exports = { setup, getIO, sendToClients, sendToUser };
