import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createCentralRouter, createHousesRouter, createUsersRouter } from '../routes';
import { createSensorsRouter } from '../routes/sensors.routes';
import { MosquittoAccess, MosquittoEventDispatcher } from '../mqtt';
import { CentralDataAccess, HouseDataAccess, SensorDataAccess, UserDataAccess } from '../models';
import { CentralService, HouseService, SensorService, UserService } from '../services';
import { WebSocketAccess } from '../websocket/websocket-access';

/** Proporciona la configuración y arranque del servidor Express, con routers y acceso a datos. */
export class App {
  static create () {
    const userDataAccess = new UserDataAccess();
    const houseDataAccess = new HouseDataAccess();
    const centralDataAccess = new CentralDataAccess();
    const sensorDataAccess = new SensorDataAccess();
    const mosquittoAccess = new MosquittoAccess();

    const userService = new UserService(userDataAccess);
    const centralService = new CentralService(userDataAccess, centralDataAccess);
    const sensorService = new SensorService(sensorDataAccess);
    const webSocketAccess = new WebSocketAccess();
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

    const app = express();

    app.use(express.json());
    app.disable('x-powered-by');
    app.use(cors());

    app.use('/api-alarma/users', createUsersRouter(userService));
    app.use('/api-alarma/houses', createHousesRouter(houseService));
    app.use('/api-alarma/sensors', createSensorsRouter(sensorService));
    app.use('/api-alarma/central', createCentralRouter(centralService));

    app.use((req, res) => {
      res.status(404).send({ ok: false, message: 'Ninguna ruta coincide con la solicitud.' });
    });

    return { app, webSocketAccess, mosquittoAccess };
  }
}
