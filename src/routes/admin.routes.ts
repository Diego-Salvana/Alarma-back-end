import { Router } from 'express';
import { HouseService, SensorService, UserService } from '../services';
import { AdminController } from '../controllers/admin.controller';
import { checkAdminJwt, validateBody } from '../middleware';
import { createHouseSchema, createSensorSchema, houseSystemInfoSchema, loginSchema, sensorSystemInfoSchema, userSystemInfoSchema } from '../utils/zod-validators';

export function createAdminRouter (
  userService: UserService, houseService: HouseService, sensorService: SensorService
): Router {
  const adminRouter = Router();
  const adminController = new AdminController(userService, houseService, sensorService);

  // Login
  adminRouter.post('/login',
    validateBody(loginSchema), adminController.login.bind(adminController)
  );

  // Users
  adminRouter.get('/users',
    checkAdminJwt, adminController.getAllUsers.bind(adminController)
  );
  adminRouter.get('/users/:userId',
    checkAdminJwt, adminController.getUser.bind(adminController)
  );
  adminRouter.patch('/users/:userId',
    validateBody(userSystemInfoSchema),
    checkAdminJwt,
    adminController.modifyUser.bind(adminController)
  );
  adminRouter.delete('/users/:userId',
    checkAdminJwt, adminController.deleteUser.bind(adminController)
  );

  // Houses
  adminRouter.post('/users/:userId/houses',
    validateBody(createHouseSchema), checkAdminJwt, adminController.createHouse.bind(adminController)
  );
  adminRouter.patch('/users/:userId/houses/:houseId',
    validateBody(houseSystemInfoSchema),
    checkAdminJwt,
    adminController.modifyHouse.bind(adminController)
  );
  adminRouter.delete('/users/:userId/houses/:houseId',
    checkAdminJwt, adminController.deleteHouse.bind(adminController)
  );

  // Sensors
  adminRouter.post('/users/:userId/houses/:houseId/sensors',
    validateBody(createSensorSchema),
    checkAdminJwt,
    adminController.createSensor.bind(adminController)
  );
  adminRouter.patch('/users/:userId/houses/:houseId/sensors/:sensorNumber',
    validateBody(sensorSystemInfoSchema),
    checkAdminJwt,
    adminController.updateSensor.bind(adminController)
  );
  adminRouter.delete('/users/:userId/houses/:houseId/sensors/:sensorNumber',
    checkAdminJwt, adminController.deleteSensor.bind(adminController)
  );

  return adminRouter;
}
