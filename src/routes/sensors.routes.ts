import { Router } from 'express';
import { SensorDataAccess } from '../schemas';
import { SensorController } from '../controllers';
import { checkJWT, createSensorValidator, updateInfoSensorValidator, updateNameSensorValidator } from '../middleware';

export const createSensorsRouter = (sensorModel: SensorDataAccess) => {
   const sensorsRouter = Router();
   const sensorController = new SensorController(sensorModel);

   sensorsRouter.post(
      '/:houseId', createSensorValidator, checkJWT, sensorController.create.bind(sensorController)
   );
   sensorsRouter.get('/:houseId/:sensorNumber', checkJWT, sensorController.getOne.bind(sensorController));
   sensorsRouter.patch(
      '/:houseId/sensor-name',
      updateNameSensorValidator,
      checkJWT,
      sensorController.updateName.bind(sensorController)
   );
   sensorsRouter.patch(
      '/:houseId/:sensorNumber/info',
      updateInfoSensorValidator,
      checkJWT,
      sensorController.updateInfo.bind(sensorController)
   );
   sensorsRouter.delete('/:houseId/:sensorNumber', checkJWT, sensorController.delete.bind(sensorController));

   return sensorsRouter;
};
