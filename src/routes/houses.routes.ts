import { Router } from 'express';
import { HouseDataAccess } from '../schemas';
import { HouseController } from '../controllers';
import { checkJWT, createHouseValidator, updateHouseValidator } from '../middleware';

export const createHousesRouter = () => {
   const housesRouter = Router();
   const housesModel = new HouseDataAccess();
   const houseController = new HouseController(housesModel);

   housesRouter.post('/', createHouseValidator, checkJWT, houseController.create.bind(houseController));
   // housesRouter.get('/', checkJWT, (req, res) => { /* TODO: agregar controlador */ });
   housesRouter.get('/:id', checkJWT, houseController.getHouse.bind(houseController));
   housesRouter.patch('/:id', updateHouseValidator, checkJWT, houseController.update.bind(houseController));
   housesRouter.delete('/:id', checkJWT, houseController.delete.bind(houseController));

   return housesRouter;
};
