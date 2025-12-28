import { Router } from 'express';
import { UserService } from '../services';
import { UserController } from '../controllers';
import { loginValidator, registerValidator, updateUserValidator } from '../middleware';
import { checkJWT } from '../middleware/jwt-check';

export const createUsersRouter = (userService: UserService) => {
  const usersRouter = Router();
  const userController = new UserController(userService);

  usersRouter.get('/',
    checkJWT, userController.getById.bind(userController)
  );
  usersRouter.post('/register',
    registerValidator, userController.create.bind(userController)
  );
  usersRouter.post('/login',
    loginValidator, userController.login.bind(userController)
  );
  usersRouter.patch('/',
    updateUserValidator, checkJWT, userController.update.bind(userController)
  );
  usersRouter.delete('/',
    checkJWT, userController.delete.bind(userController)
  );

  return usersRouter;
};
