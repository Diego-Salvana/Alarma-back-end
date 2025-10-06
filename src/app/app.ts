import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createCentralRouter, createHousesRouter, createUsersRouter } from '../routes';
import { createSensorsRouter } from '../routes/sensors.routes';
import { MosquittoAccess } from '../mqtt';
import { CentralDataAccess, HouseDataAccess, SensorDataAccess, UserDataAccess } from '../schemas';

export class App {
  static centralDataAccess = new CentralDataAccess();
  static userDataAccess = new UserDataAccess();
  static houseDataAccess = new HouseDataAccess();
  static sensorDataAccess = new SensorDataAccess();
  static mosquittoAccess = new MosquittoAccess(this.houseDataAccess, this.sensorDataAccess);

  static create () {
    const app = express();

    app.use(express.json());
    app.disable('x-powered-by');
    app.use(cors());

    app.use('/api-alarma/users', createUsersRouter(this.userDataAccess));
    app.use('/api-alarma/houses', createHousesRouter(
      this.houseDataAccess, this.mosquittoAccess, this.userDataAccess
    ));
    app.use('/api-alarma/sensors', createSensorsRouter(this.sensorDataAccess));
    app.use('/api-alarma/central', createCentralRouter(this.centralDataAccess));

    app.use((req, res) => {
      res.status(404).send({ ok: false, message: 'Ninguna ruta coincide con la solicitud.' });
    });

    this.mosquittoAccess.connect();

    return app;
  }
}
