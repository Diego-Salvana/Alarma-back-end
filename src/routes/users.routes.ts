import { Router } from 'express';
import { UserDataAccess } from '../schemas';
import { UserController } from '../controllers';
import { loginValidator, registerValidator, updateUserValidator } from '../middleware';
import { checkJWT } from '../middleware/jwt-check';

export const createUsersRouter = () => {
   const usersRouter = Router();
   const userModel = new UserDataAccess();
   const userController = new UserController(userModel);

   usersRouter.post('/register', registerValidator, userController.create.bind(userController));
   usersRouter.post('/login', loginValidator, userController.login.bind(userController));
   usersRouter.patch('/', updateUserValidator, checkJWT, userController.update.bind(userController));
   usersRouter.delete('/', checkJWT, userController.delete.bind(userController));

   return usersRouter;
};
