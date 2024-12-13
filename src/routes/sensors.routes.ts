import { Router } from 'express';
import { SensorDataAccess } from '../schemas';
import { SensorController } from '../controllers';
import { checkJWT } from '../middleware';

export const createSensorsRouter = () => {
   const sensorsRouter = Router();
   const sensorsModel = new SensorDataAccess();
   const sensorController = new SensorController(sensorsModel);

   // sensorsRouter.post('/', checkJWT, sensorController.create.bind(sensorController));
   // sensorsRouter.get('/:id', checkJWT, sensorController.getHouse.bind(sensorController));
   // sensorsRouter.patch('/:id', updateHouseValidator, checkJWT, sensorController.update.bind(sensorController));
   // sensorsRouter.delete('/:id', checkJWT, sensorController.delete.bind(sensorController));

   return sensorsRouter;
};
