import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { MongoDB } from './database/mongo-db';
import { App } from './app/app';

MongoDB.connect();

const serverApp = createServer(App.create());

const io = new Server(serverApp, {
  cors: { origin: '*' },
  path: '/api-alarma/socket'
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('disconnect', () => {
    console.log('Un usuario se desconectó ☹️');
  });

  // Evento de prueba.
  socket.on('topico/usuario_1', (data: string) => {
    console.log(`Respuesta de sockets: ${data}`);
  });
});

/** Envía datos a través de ``websockets``. */
export const emitDataSockets = (topic: string, data: any) => {
  io.emit(topic, data);
};

const PORT = process.env.PORT ?? 1234;

serverApp.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto: ${PORT} 🚀`);
});
