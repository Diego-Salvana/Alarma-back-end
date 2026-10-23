import { Router } from 'express';
import { UserService } from '../services';
import { UserController } from '../controllers';
import { blockDemoUser, blockEmailInDemo, checkVerificationJwt, checkUserJwt, validateBody } from '../middlewares';
import { loginSchema, registerSchema, updateUserSchema, verificationEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/zod-validators';

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
    blockEmailInDemo, validateBody(verificationEmailSchema), userController.sendVerificationEmail.bind(userController)
  );
  usersRouter.post('/verify-email',
    checkVerificationJwt, userController.verifyEmail.bind(userController)
  );
  usersRouter.post('/forgot-password',
    blockEmailInDemo, validateBody(forgotPasswordSchema), userController.forgotPassword.bind(userController)
  );
  usersRouter.post('/reset-password',
    validateBody(resetPasswordSchema), checkVerificationJwt, userController.resetPassword.bind(userController)
  );
  usersRouter.patch('/',
    checkUserJwt, blockDemoUser, validateBody(updateUserSchema), userController.update.bind(userController)
  );

  return usersRouter;
};
