import { Router } from 'express';
import { HouseService } from '../services';
import { HouseController } from '../controllers';
import { checkUserJwt, validateBody } from '../middleware';
import { exclusionArraySchema, triggeredSchema, updateHouseSchema } from '../utils/zod-validators';

export const createHousesRouter = (houseService: HouseService) => {
  const housesRouter = Router();
  const houseController = new HouseController(houseService);

  housesRouter.get('/',
    checkUserJwt, houseController.getAll.bind(houseController)
  );
  housesRouter.get('/:id',
    checkUserJwt, houseController.getOne.bind(houseController)
  );
  housesRouter.post('/arm',
    validateBody(exclusionArraySchema), checkUserJwt, houseController.armAlarm.bind(houseController)
  );
  housesRouter.post('/disarm',
    checkUserJwt, houseController.disarmAlarm.bind(houseController)
  );
  housesRouter.patch('/name-dir/:id',
    validateBody(updateHouseSchema), checkUserJwt, houseController.update.bind(houseController)
  );
  housesRouter.post('/lights',
    checkUserJwt, houseController.setLights.bind(houseController)
  );
  housesRouter.post('/trigger',
    validateBody(triggeredSchema), checkUserJwt, houseController.triggerAlarm.bind(houseController)
  );

  return housesRouter;
};
