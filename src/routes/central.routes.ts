import { Router } from 'express';
import { CentralService } from '../services';
import { CentralController } from '../controllers';
import { checkJWT, updateCentralCodeValidator, updateCentralInfoValidator } from '../middleware';

export const createCentralRouter = (centralService: CentralService) => {
  const centralRouter = Router();
  const centralController = new CentralController(centralService);

  // Usuario con token
  centralRouter.get('/',
    checkJWT, centralController.getHistory.bind(centralController)
  );
  centralRouter.patch('/code',
    updateCentralCodeValidator, checkJWT, centralController.updateCode.bind(centralController)
  );

  // Administrador (refactorizar)
  centralRouter.patch('/:houseId/info',
    updateCentralInfoValidator, checkJWT, centralController.updateInfo.bind(centralController)
  );

  return centralRouter;
};
