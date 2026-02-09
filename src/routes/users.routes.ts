import { Router } from 'express';
import { UserService } from '../services';
import { UserController } from '../controllers';
import { checkVerificationJwt, loginValidator, registerValidator, updateUserValidator } from '../middleware';
import { checkUserJwt } from '../middleware/user-jwt-check';

export const createUsersRouter = (userService: UserService) => {
  const usersRouter = Router();
  const userController = new UserController(userService);

  usersRouter.get('/',
    checkUserJwt, userController.getById.bind(userController)
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
    checkVerificationJwt, userController.verifyEmail.bind(userController)
  );
  usersRouter.post('/forgot-password',
    userController.forgotPassword.bind(userController)
  );
  usersRouter.post('/reset-password',
    checkVerificationJwt, userController.resetPassword.bind(userController)
  );
  usersRouter.patch('/',
    updateUserValidator, checkUserJwt, userController.update.bind(userController)
  );

  return usersRouter;
};
