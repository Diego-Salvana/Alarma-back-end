import { Router } from 'express';
import { CentralService } from '../services';
import { CentralController } from '../controllers';
import { checkUserJwt, validateBody } from '../middleware';
import { centralCodeSchema } from '../utils/zod-validators';

export const createCentralRouter = (centralService: CentralService) => {
  const centralRouter = Router();
  const centralController = new CentralController(centralService);

  centralRouter.get('/',
    checkUserJwt, centralController.getHistory.bind(centralController)
  );
  centralRouter.patch('/code',
    validateBody(centralCodeSchema),
    checkUserJwt,
    centralController.updateCode.bind(centralController)
  );

  return centralRouter;
};
