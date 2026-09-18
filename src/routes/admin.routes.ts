import { Router } from 'express';
import { AdminService, AuditService } from '../services';
import { AdminController } from '../controllers/admin.controller';
import { checkAdminJwt, requireSuperadmin, validateBody } from '../middlewares';
import { createAdminSchema, createHouseSchema, createSensorSchema, houseSystemInfoSchema, loginSchema, sensorSystemInfoSchema, updateAdminSchema, userSystemInfoSchema } from '../utils/zod-validators';

export function createAdminRouter (
  adminService: AdminService, auditService: AuditService
): Router {
  const adminRouter = Router();
  const adminController = new AdminController(adminService, auditService);

  // Login
  adminRouter.post('/login',
    validateBody(loginSchema), adminController.login.bind(adminController)
  );

  // Identidad
  adminRouter.get('/me',
    checkAdminJwt, adminController.getMe.bind(adminController)
  );

  // Admins (solo superadmin)
  adminRouter.get('/admins',
    checkAdminJwt, requireSuperadmin, adminController.getAllAdmins.bind(adminController)
  );
  adminRouter.post('/admins',
    validateBody(createAdminSchema),
    checkAdminJwt, requireSuperadmin,
    adminController.createAdmin.bind(adminController)
  );
  adminRouter.get('/admins/:adminId',
    checkAdminJwt, requireSuperadmin, adminController.getAdmin.bind(adminController)
  );
  adminRouter.patch('/admins/:adminId',
    validateBody(updateAdminSchema),
    checkAdminJwt, requireSuperadmin,
    adminController.updateAdmin.bind(adminController)
  );
  adminRouter.delete('/admins/:adminId',
    checkAdminJwt, requireSuperadmin, adminController.deactivateAdmin.bind(adminController)
  );

  // Auditoría (lectura para ambos roles)
  adminRouter.get('/audit-logs',
    checkAdminJwt, adminController.getAuditLogs.bind(adminController)
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
