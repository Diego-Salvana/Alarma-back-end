import { Router } from 'express';
import { SensorService } from '../services';
import { SensorController } from '../controllers';
import { blockDemoUser, checkUserJwt, validateBody } from '../middleware';
import { sensorNameSchema } from '../utils/zod-validators';

export const createSensorsRouter = (sensorService: SensorService) => {
  const sensorsRouter = Router();
  const sensorController = new SensorController(sensorService);

  sensorsRouter.get('/:sensorNumber',
    checkUserJwt, sensorController.getOne.bind(sensorController)
  );
  sensorsRouter.patch('/sensor-name',
    checkUserJwt, blockDemoUser, validateBody(sensorNameSchema), sensorController.updateName.bind(sensorController)
  );

  return sensorsRouter;
};
