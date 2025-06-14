let io;

function initWebSocket(server) {
  const socketIO = require('socket.io');
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 WebSocket client connecté : ', socket.id);
    socket.on('disconnect', () => {
      console.log('🔴 Client déconnecté : ', socket.id);
    });
  });
}

function sendToClients(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initWebSocket,
  sendToClients,
};
