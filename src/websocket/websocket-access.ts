import { Server, Socket } from 'socket.io';
import { JwtHandler } from '../utils';

export class WebSocketAccess {
  private io!: Server;

  connect (serverApp: any) {
    this.io = new Server(serverApp, {
      cors: { origin: ['http://localhost:4200'] },
      path: '/api-alarma/socket'
    });

    // Middleware de autenticación
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('No autorizado'));
      }

      try {
        JwtHandler.verifyToken(token);

        next();
      } catch {
        next(new Error('Token inválido'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Usuario conectado');

      socket.on('disconnect', () => {
        console.log('Un usuario se desconectó ☹️');
      });
    });
  }

  /** Envía datos a través de websockets */
  emitSocketData<T>(topic: string, data: T) {
    this.io.emit(topic, data);
  }
}
