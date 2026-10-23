import { createServer } from 'node:http';
import { connectPostgres } from './database/access/postgres';
import { App } from './app/app';
import { connectMongo } from './database/access/mongodb';

function bootstrap () {
  const { app, webSocketAccess, mosquittoAccess } = App.create();
  const serverApp = createServer(app);

  void connectMongo();
  void connectPostgres();
  webSocketAccess.connect(serverApp);
  mosquittoAccess.connect();
  
  const PORT = process.env.PORT;
  
  if (!PORT) throw new Error('PORT not configured');
  
  serverApp.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT} 🚀`);
  });
}

bootstrap();
