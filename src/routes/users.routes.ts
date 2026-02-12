import { Router } from 'express';
import { UserService } from '../services';
import { UserController } from '../controllers';
import { checkVerificationJwt, checkUserJwt, validateBody } from '../middleware';
import { loginSchema, registerSchema, updateUserSchema } from '../utils/zod-validators';

export const createUsersRouter = (userService: UserService) => {
  const usersRouter = Router();
  const userController = new UserController(userService);

  usersRouter.get('/',
    checkUserJwt, userController.getById.bind(userController)
  );
  usersRouter.post('/register',
    validateBody(registerSchema), userController.create.bind(userController)
  );
  usersRouter.post('/login',
    validateBody(loginSchema), userController.login.bind(userController)
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
    validateBody(updateUserSchema), checkUserJwt, userController.update.bind(userController)
  );

  return usersRouter;
};
