import { Router } from 'express';
import { SensorService } from '../services';
import { SensorController } from '../controllers';
import { checkJWT, createSensorValidator, updateInfoSensorValidator, updateNameSensorValidator } from '../middleware';

export const createSensorsRouter = (sensorService: SensorService) => {
  const sensorsRouter = Router();
  const sensorController = new SensorController(sensorService);

  sensorsRouter.get('/:sensorNumber',
    checkJWT, sensorController.getOne.bind(sensorController)
  );
  sensorsRouter.patch('/sensor-name',
    updateNameSensorValidator, checkJWT, sensorController.updateName.bind(sensorController)
  );
   
  // Rutas para administrador.
  sensorsRouter.post('/',
    createSensorValidator, checkJWT, sensorController.create.bind(sensorController)
  );
  sensorsRouter.patch('/:houseId/info/:sensorNumber',
    updateInfoSensorValidator,
    checkJWT,
    sensorController.updateInfo.bind(sensorController)
  );
  sensorsRouter.delete('/:houseId/:sensorNumber',
    checkJWT, sensorController.delete.bind(sensorController)
  );

  return sensorsRouter;
};
