let io;

function setup(server) {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 Client WebSocket connecté :', socket.id);

    socket.on('disconnect', () => {
      console.log('🔴 Client déconnecté :', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io non initialisé');
  return io;
}

module.exports = {
  setup,
  get io() {
    return getIO();
  }
};
