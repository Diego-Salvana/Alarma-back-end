import { Router } from 'express';
import { CentralService } from '../services';
import { CentralController } from '../controllers';
import { blockDemoUser, checkUserJwt, validateBody } from '../middleware';
import { centralCodeSchema } from '../utils/zod-validators';

export const createCentralRouter = (centralService: CentralService) => {
  const centralRouter = Router();
  const centralController = new CentralController(centralService);

  centralRouter.get('/',
    checkUserJwt, centralController.getHistory.bind(centralController)
  );
  centralRouter.patch('/code/:houseId',
    checkUserJwt,
    blockDemoUser,
    validateBody(centralCodeSchema),
    centralController.updateCode.bind(centralController)
  );

  return centralRouter;
};
