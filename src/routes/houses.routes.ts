import { Router } from 'express';
import { HouseDataAccess, UserDataAccess } from '../schemas';
import { HouseController } from '../controllers';
import { checkJWT, createHouseValidator, exclusionArrayValidator, updateHouseValidator } from '../middleware';
import { MosquittoAccess } from '../mqtt';

export const createHousesRouter = (
  houseDataAccess: HouseDataAccess,
  mosquittoAccess: MosquittoAccess,
  userDataAccess: UserDataAccess
) => {
  const housesRouter = Router();
  const houseController = new HouseController(houseDataAccess, mosquittoAccess, userDataAccess);

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

  return housesRouter;
};
