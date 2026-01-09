import { Router } from 'express';
import { CentralService } from '../services';
import { CentralController } from '../controllers';
import { checkJwt, updateCentralCodeValidator, updateCentralInfoValidator } from '../middleware';

export const createCentralRouter = (centralService: CentralService) => {
  const centralRouter = Router();
  const centralController = new CentralController(centralService);

  // Usuario con token
  centralRouter.get('/',
    checkJwt, centralController.getHistory.bind(centralController)
  );
  centralRouter.patch('/code',
    updateCentralCodeValidator, checkJwt, centralController.updateCode.bind(centralController)
  );

  // Administrador (refactorizar)
  centralRouter.patch('/:houseId/info',
    updateCentralInfoValidator, checkJwt, centralController.updateInfo.bind(centralController)
  );

  return centralRouter;
};
