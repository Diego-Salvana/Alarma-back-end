import { Router } from 'express';
import { CentralDataAccess } from '../schemas';
import { CentralController } from '../controllers';
import { checkJWT, updateCentralCodeValidator, updateCentralInfoValidator } from '../middleware';

export const createCentralRouter = () => {
   const centralRouter = Router();
   const centralModel = new CentralDataAccess();
   const centralController = new CentralController(centralModel);

   centralRouter.get('/:houseId', checkJWT, centralController.getOne.bind(centralController));
   centralRouter.patch(
      '/:houseId/code',
      updateCentralCodeValidator,
      checkJWT,
      centralController.updateCode.bind(centralController)
   );
   centralRouter.patch(
      '/:houseId/info',
      updateCentralInfoValidator,
      checkJWT,
      centralController.updateInfo.bind(centralController)
   );

   return centralRouter;
};
