import { Router } from 'express';
import { UserService } from '../services';
import { AdminController } from '../controllers/admin.controller';
import { checkAdminJwt, createHouseValidator, createSensorValidator, updateInfoSensorValidator } from '../middleware';

export function createAdminRouter (userService: UserService) {
  const adminRouter = Router();
  const adminController = new AdminController(userService);

  // Users
  adminRouter.get('/users',
    checkAdminJwt, adminController.getAllUsers.bind(adminController)
  );
  adminRouter.get('/users/:userId',
    checkAdminJwt, adminController.getUser.bind(adminController)
  );
  adminRouter.patch('/users/:userId',
    checkAdminJwt, adminController.modifyUser.bind(adminController)
  );
  adminRouter.delete('/users/:userId',
    checkAdminJwt, adminController.deleteUser.bind(adminController)
  );

  // Houses
  adminRouter.post('/users/:userId/houses',
    createHouseValidator, checkAdminJwt, adminController.createHouse.bind(adminController)
  );
  adminRouter.patch('/users/:userId/houses/:houseId',
    checkAdminJwt, adminController.modifyHouse.bind(adminController)
  );
  adminRouter.delete('/users/:userId/houses/:houseId',
    checkAdminJwt, adminController.deleteHouse.bind(adminController)
  );

  // Sensors
  adminRouter.post('/users/:userId/houses/:houseId/sensors',
    createSensorValidator, checkAdminJwt, adminController.createSensor.bind(adminController)
  );
  adminRouter.patch('/users/:userId/houses/:houseId/sensors/:sensorNumber',
    updateInfoSensorValidator, checkAdminJwt, adminController.updateSensor.bind(adminController)
  );
  adminRouter.delete('/users/:userId/houses/:houseId/sensors/:sensorNumber',
    checkAdminJwt, adminController.deleteSensor.bind(adminController)
  );

  return adminRouter;
}
