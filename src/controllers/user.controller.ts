import { Request, Response } from 'express';
import { UserService } from '../services';
import { RequestExt } from '../interfaces';
import { ErrorHandler } from '../utils';

/** Gestiona peticiones y respuestas vinculadas a Usuarios. */
export class UserController {
  constructor (private userService: UserService) {}

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

  async getById ({ userPayload }: RequestExt, res: Response) {
    const id = userPayload?.sub as string;

    try {
      const responseUser = await this.userService.getById(id);
      res.status(200).json({ message: 'Get by id successfully', data: responseUser });
    } catch (e) {
      ErrorHandler.generateResponse(res, e, 'Ocurrió un error al obtener usuario');
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
