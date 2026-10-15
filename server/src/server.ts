import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initSocketServer } from './sockets/socketServer.js';

const port = Number(process.env.PORT || 8080);
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocketServer(httpServer);

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Group Chat API & Socket.IO server listening on http://localhost:${port}`);
});