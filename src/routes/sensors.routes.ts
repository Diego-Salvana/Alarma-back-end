import { Router } from 'express';
import { SensorService } from '../services';
import { SensorController } from '../controllers';
import { checkUserJwt, validateBody } from '../middleware';
import { sensorNameSchema } from '../utils/zod-validators';

export const createSensorsRouter = (sensorService: SensorService) => {
  const sensorsRouter = Router();
  const sensorController = new SensorController(sensorService);

  sensorsRouter.get('/:sensorNumber',
    checkUserJwt, sensorController.getOne.bind(sensorController)
  );
  sensorsRouter.patch('/sensor-name',
    validateBody(sensorNameSchema), checkUserJwt, sensorController.updateName.bind(sensorController)
  );

  return sensorsRouter;
};
