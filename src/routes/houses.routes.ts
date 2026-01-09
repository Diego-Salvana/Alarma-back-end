import { Router } from 'express';
import { HouseService } from '../services';
import { HouseController } from '../controllers';
import { checkJwt, createHouseValidator, exclusionArrayValidator, triggeredValidator, updateHouseValidator } from '../middleware';

export const createHousesRouter = (houseService: HouseService) => {
  const housesRouter = Router();
  const houseController = new HouseController(houseService);

  housesRouter.get('/',
    checkJwt, houseController.getAll.bind(houseController)
  );
  housesRouter.get('/:id',
    checkJwt, houseController.getOne.bind(houseController)
  );
  housesRouter.post('/',
    createHouseValidator, checkJwt, houseController.create.bind(houseController)
  );
  housesRouter.post('/arm',
    exclusionArrayValidator, checkJwt, houseController.armAlarm.bind(houseController)
  );
  housesRouter.post('/disarm',
    checkJwt, houseController.disarmAlarm.bind(houseController)
  );
  housesRouter.patch('/name-dir/:id',
    updateHouseValidator, checkJwt, houseController.update.bind(houseController)
  );
  housesRouter.delete('/:id',
    checkJwt, houseController.delete.bind(houseController)
  );
  housesRouter.post('/lights',
    checkJwt, houseController.setLights.bind(houseController)
  );
  housesRouter.post('/trigger',
    triggeredValidator, checkJwt, houseController.triggerAlarm.bind(houseController)
  );

  return housesRouter;
};
