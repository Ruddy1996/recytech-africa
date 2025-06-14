const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

// Initialise socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // à sécuriser en prod
    methods: ['GET', 'POST']
  }
});

// Partage l'instance io dans l'app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🟢 Nouvelle connexion socket : ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔴 Socket déconnecté : ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
