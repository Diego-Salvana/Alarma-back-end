import { Router } from 'express';
import { UserService } from '../services';
import { UserController } from '../controllers';
import { loginValidator, registerValidator, updateUserValidator } from '../middleware';
import { checkJwt } from '../middleware/jwt-check';

export const createUsersRouter = (userService: UserService) => {
  const usersRouter = Router();
  const userController = new UserController(userService);

  usersRouter.get('/',
    checkJwt, userController.getById.bind(userController)
  );
  usersRouter.post('/register',
    registerValidator, userController.create.bind(userController)
  );
  usersRouter.post('/login',
    loginValidator, userController.login.bind(userController)
  );
  usersRouter.post('/send-verification-email',
    userController.sendVerificationEmail.bind(userController)
  );
  usersRouter.post('/verify-email',
    userController.verifyEmail.bind(userController)
  );
  usersRouter.post('/forgot-password',
    userController.forgotPassword.bind(userController)
  );
  usersRouter.post('/reset-password',
    userController.resetPassword.bind(userController)
  );
  usersRouter.patch('/',
    updateUserValidator, checkJwt, userController.update.bind(userController)
  );
  usersRouter.delete('/',
    checkJwt, userController.delete.bind(userController)
  );

  return usersRouter;
};
