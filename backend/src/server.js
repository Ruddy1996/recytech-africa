// server.js
const app = require('./app');
const http = require('http');
const { setup } = require('./sockets/io');
require('./jobs/tirageAuto');

const server = http.createServer(app);

// Initialise socket.io AVANT le listen
setup(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on https://recytech-africa-production.up.railway.app:${PORT}`);
  console.log(`📚 Swagger UI available at https://recytech-africa-production.up.railway.app:${PORT}/api-docs`);
});
