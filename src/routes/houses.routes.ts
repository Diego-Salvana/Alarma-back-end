import { Router } from 'express';
import { HouseService } from '../services';
import { HouseController } from '../controllers';
import { checkJWT, createHouseValidator, exclusionArrayValidator, triggeredValidator, updateHouseValidator } from '../middleware';

export const createHousesRouter = (houseService: HouseService) => {
  const housesRouter = Router();
  const houseController = new HouseController(houseService);

  housesRouter.get('/',
    checkJWT, houseController.getAll.bind(houseController)
  );
  housesRouter.get('/:id',
    checkJWT, houseController.getOne.bind(houseController)
  );
  housesRouter.post('/',
    createHouseValidator, checkJWT, houseController.create.bind(houseController)
  );
  housesRouter.post('/arm',
    exclusionArrayValidator, checkJWT, houseController.armAlarm.bind(houseController)
  );
  housesRouter.post('/disarm',
    checkJWT, houseController.disarmAlarm.bind(houseController)
  );
  housesRouter.patch('/name-dir/:id',
    updateHouseValidator, checkJWT, houseController.update.bind(houseController)
  );
  housesRouter.delete('/:id',
    checkJWT, houseController.delete.bind(houseController)
  );
  housesRouter.post('/lights',
    checkJWT, houseController.setLights.bind(houseController)
  );
  housesRouter.post('/trigger',
    triggeredValidator, checkJWT, houseController.triggerAlarm.bind(houseController)
  );

  return housesRouter;
};
