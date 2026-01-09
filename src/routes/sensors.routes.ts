import { Router } from 'express';
import { SensorService } from '../services';
import { SensorController } from '../controllers';
import { checkJwt, createSensorValidator, updateInfoSensorValidator, updateNameSensorValidator } from '../middleware';

export const createSensorsRouter = (sensorService: SensorService) => {
  const sensorsRouter = Router();
  const sensorController = new SensorController(sensorService);

  sensorsRouter.get('/:sensorNumber',
    checkJwt, sensorController.getOne.bind(sensorController)
  );
  sensorsRouter.patch('/sensor-name',
    updateNameSensorValidator, checkJwt, sensorController.updateName.bind(sensorController)
  );
   
  // Rutas para administrador.
  sensorsRouter.post('/',
    createSensorValidator, checkJwt, sensorController.create.bind(sensorController)
  );
  sensorsRouter.patch('/:houseId/info/:sensorNumber',
    updateInfoSensorValidator,
    checkJwt,
    sensorController.updateInfo.bind(sensorController)
  );
  sensorsRouter.delete('/:houseId/:sensorNumber',
    checkJwt, sensorController.delete.bind(sensorController)
  );

  return sensorsRouter;
};
