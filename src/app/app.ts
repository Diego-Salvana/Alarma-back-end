import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createAdminRouter, createCentralRouter, createHousesRouter, createUsersRouter } from '../routes';
import { createSensorsRouter } from '../routes/sensors.routes';
import { MosquittoAccess, MosquittoEventDispatcher } from '../mqtt';
import { CentralDataAccess, HouseDataAccess, SensorDataAccess, UserDataAccess } from '../database/models';
import { CentralService, DemoResetService, EmailService, HouseService, SensorService, UserService } from '../services';
import { WebSocketAccess } from '../websocket/websocket-access';
import { startDemoResetJob } from '../jobs/demo-reset.job';

export class App {
  static create () {
    const userDataAccess = new UserDataAccess();
    const houseDataAccess = new HouseDataAccess();
    const centralDataAccess = new CentralDataAccess();
    const sensorDataAccess = new SensorDataAccess();
    const mosquittoAccess = new MosquittoAccess();
    const webSocketAccess = new WebSocketAccess();

    const emailService = new EmailService();
    const userService = new UserService(userDataAccess, emailService);
    const centralService = new CentralService(userDataAccess, centralDataAccess);
    const sensorService = new SensorService(sensorDataAccess);
    const houseService = new HouseService(
      userDataAccess,
      houseDataAccess,
      centralDataAccess,
      sensorDataAccess,
      webSocketAccess,
      mosquittoAccess
    );
    
    const mosquittoEventDispatcher = new MosquittoEventDispatcher(houseService);
    mosquittoAccess.setDispatcher(mosquittoEventDispatcher);

    const demoResetService = new DemoResetService(userDataAccess, houseDataAccess);
    startDemoResetJob(demoResetService);

    // Prueba de conexión al email
    emailService.checkConnection();

    const app = express();
    const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
      .split(',')
      .map(origin => origin.trim());

    app.use(express.json());
    app.disable('x-powered-by');
    app.use(cors({ origin: corsOrigins }));

    app.use('/api-alarma/users', createUsersRouter(userService));
    app.use('/api-alarma/houses', createHousesRouter(houseService));
    app.use('/api-alarma/sensors', createSensorsRouter(sensorService));
    app.use('/api-alarma/central', createCentralRouter(centralService));
    app.use('/api-alarma/admin', createAdminRouter(userService, houseService, sensorService));

    app.use((_, res) => {
      res.status(404).send({ ok: false, message: 'Ninguna ruta coincide con la solicitud.' });
    });

    return { app, webSocketAccess, mosquittoAccess };
  }
}
