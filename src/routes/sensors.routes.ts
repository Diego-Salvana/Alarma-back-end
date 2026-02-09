import { Router } from 'express';
import { SensorService } from '../services';
import { SensorController } from '../controllers';
import { checkUserJwt, updateNameSensorValidator } from '../middleware';

export const createSensorsRouter = (sensorService: SensorService) => {
  const sensorsRouter = Router();
  const sensorController = new SensorController(sensorService);

  sensorsRouter.get('/:sensorNumber',
    checkUserJwt, sensorController.getOne.bind(sensorController)
  );
  sensorsRouter.patch('/sensor-name',
    updateNameSensorValidator, checkUserJwt, sensorController.updateName.bind(sensorController)
  );

  return sensorsRouter;
};
