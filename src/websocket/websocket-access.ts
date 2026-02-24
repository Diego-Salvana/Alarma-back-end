import { Server } from 'socket.io';

export class WebSocketAccess {
  private io!: Server;

  connect (serverApp: any) {
    this.io = new Server(serverApp, {
      cors: { origin: '*' },
      path: '/api-alarma/socket'
    });
    
    this.io.on('connection', (socket) => {
      console.log('Usuario conectado');
      
      socket.on('disconnect', () => {
        console.log('Un usuario se desconectó ☹️');
      });
    });
  }
    
  /** Envía datos a través de ``websockets``. */
  emitSocketData <T>(topic: string, data: T) {
    this.io.emit(topic, data);
  };
}
