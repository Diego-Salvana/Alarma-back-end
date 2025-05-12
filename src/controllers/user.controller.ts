import { Request, Response } from 'express';
import { UserService } from '../services';
import { IUserDataAccess, RequestExt } from '../interfaces';
import { ErrorHandler } from '../utils';

export class UserController {
   private userService: UserService;

   constructor (userDataAccess: IUserDataAccess) {
      this.userService = new UserService(userDataAccess);
   }

   async create ({ body }: Request, res: Response) {
      try {
         const responseUser = await this.userService.create(body);
         res.status(201).json({ message: 'Created successfully', data: responseUser });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear usuario');
      }
   }

   async login ({ body }: Request, res: Response) {
      try {
         const responseUser = await this.userService.login(body);
         res.status(200).json({ message: 'Login successfully', data: responseUser });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al iniciar sesión');
      }
   }

   async update ({ body, userPayload }: RequestExt, res: Response) {
      const id = userPayload?.sub as string;

      try {
         const responseUser = await this.userService.update(id, body);
         res.status(200).json({ message: 'Updated successfully', data: responseUser });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar usuario');
      }
   }

   async delete ({ userPayload }: RequestExt, res: Response) {
      const id = userPayload?.sub as string;

      try {
         await this.userService.delete(id);
         res.status(200).json({ message: 'Deleted successfully' });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al borrar usuario');
      }
   }
}
