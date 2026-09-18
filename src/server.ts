import { createServer } from 'node:http';
import { MongoDB } from './database/access/mongodb/mongo-db';
import { connectPostgres } from './database/access/postgres';
import { App } from './app/app';

function bootstrap () {
  const { app, webSocketAccess, mosquittoAccess } = App.create();
  const serverApp = createServer(app);

  MongoDB.connect();
  void connectPostgres();
  webSocketAccess.connect(serverApp);
  mosquittoAccess.connect();
  
  const PORT = process.env.PORT ?? 1234;
  
  serverApp.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto: ${PORT} 🚀`);
  });
}

bootstrap();
