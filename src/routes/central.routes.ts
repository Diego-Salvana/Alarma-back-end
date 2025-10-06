import { Router } from 'express';
import { CentralDataAccess } from '../schemas';
import { CentralController } from '../controllers';
import { checkJWT, updateCentralCodeValidator, updateCentralInfoValidator } from '../middleware';

export const createCentralRouter = (centralModel: CentralDataAccess) => {
  const centralRouter = Router();
  const centralController = new CentralController(centralModel);

  // Usuario con token
  centralRouter.get('/', checkJWT, centralController.getHistory.bind(centralController));
  centralRouter.patch('/code', updateCentralCodeValidator, checkJWT, centralController.updateCode.bind(centralController));
   
  // Administrador (refactorizar)
  centralRouter.patch(
    '/:houseId/info',
    updateCentralInfoValidator,
    checkJWT,
    centralController.updateInfo.bind(centralController)
  );

  return centralRouter;
};
