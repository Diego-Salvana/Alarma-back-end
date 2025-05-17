import { Router } from 'express';
import { SensorDataAccess } from '../schemas';
import { SensorController } from '../controllers';
import { checkJWT, createSensorValidator, updateInfoSensorValidator, updateNameSensorValidator } from '../middleware';

export const createSensorsRouter = (sensorModel: SensorDataAccess) => {
   const sensorsRouter = Router();
   const sensorController = new SensorController(sensorModel);

   sensorsRouter.get('/:sensorNumber', checkJWT, sensorController.getOne.bind(sensorController));
   sensorsRouter.patch('/sensor-name', updateNameSensorValidator, checkJWT, sensorController.updateName.bind(sensorController));
   
   // Modificable por administrador
   sensorsRouter.post('/', createSensorValidator, checkJWT, sensorController.create.bind(sensorController));
   sensorsRouter.patch(
      '/:houseId/info/:sensorNumber',
      updateInfoSensorValidator,
      checkJWT,
      sensorController.updateInfo.bind(sensorController)
   );
   sensorsRouter.delete('/:houseId/:sensorNumber', checkJWT, sensorController.delete.bind(sensorController));

   return sensorsRouter;
};
