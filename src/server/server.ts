import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHousesRouter, createUsersRouter } from '../routes';
import { createSensorsRouter } from '../routes/sensors.routes';

export class App {
   static create () {
      const app = express();

      app.use(express.json());
      app.disable('x-powered-by');
      app.use(cors());

      app.use('/api/users', createUsersRouter());
      app.use('/api/houses', createHousesRouter());
      app.use('/api/sensors', createSensorsRouter());

      app.use((req, res) => {
         res.status(404).send({ ok: false, message: 'Ninguna ruta conicide con la solicitud.' });
      });

      const PORT = process.env.PORT ?? 1234;

      app.listen(PORT, () => {
         console.log(`Server is running on http://localhost:${PORT} 🚀`);
      });
   }
}
