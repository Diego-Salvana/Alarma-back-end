import { Router } from 'express';
import { HouseDataAccess, UserDataAccess } from '../schemas';
import { HouseController } from '../controllers';
import { checkJWT, createHouseValidator, exclusionArrayValidator, updateHouseValidator } from '../middleware';
import { MosquittoAccess } from '../mqtt';

export const createHousesRouter = (
  houseModel: HouseDataAccess,
  mosquittoAcces: MosquittoAccess,
  userDataAccess: UserDataAccess
) => {
  const housesRouter = Router();
  const houseController = new HouseController(houseModel, mosquittoAcces, userDataAccess);

  housesRouter.post(
    '/', createHouseValidator, checkJWT, houseController.create.bind(houseController)
  );
  housesRouter.post(
    '/active', exclusionArrayValidator, checkJWT, houseController.activeAlarm.bind(houseController)
  );
  housesRouter.get('/disarm', checkJWT, houseController.disarmAlarm.bind(houseController));
  housesRouter.get('/', checkJWT, houseController.getAll.bind(houseController));
  housesRouter.get('/:id', checkJWT, houseController.getHouse.bind(houseController));
  housesRouter.patch(
    '/name-dir/:id', updateHouseValidator, checkJWT, houseController.update.bind(houseController)
  );
  housesRouter.delete('/:id', checkJWT, houseController.delete.bind(houseController));

  return housesRouter;
};
