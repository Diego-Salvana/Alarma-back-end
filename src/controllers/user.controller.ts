import { Request, Response } from 'express';
import { UserService } from '../services';
import { RequestExt } from '../interfaces';
import { BadRequest, ErrorHandler } from '../utils';

/** Gestiona peticiones y respuestas vinculadas a Usuarios. */
export class UserController {
  constructor (private userService: UserService) {}

  async create ({ body }: Request, res: Response) {
    try {
      await this.userService.create(body);
      res.status(201).json({ message: 'Creación exitosa' });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear usuario');
    }
  }

  async login ({ body }: Request, res: Response) {
    try {
      const responseUser = await this.userService.login(body);
      res.status(200).json({ message: 'Inicio de sesión exitoso', data: responseUser });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al iniciar sesión');
    }
  }

  async verifyEmail ({ body }: Request, res: Response) {
    try {
      const { token } = body;
      if (!token) throw new BadRequest('Falta información para verificar correo');

      const sesionToken = await this.userService.verifyEmail(token);
      res.status(200).json({ message: 'Verificación exitosa', token: sesionToken });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al verificar correo');
    }
  }

  async forgotPassword ({ body }: Request, res: Response) {
    try {
      const { email } = body;
      if (!email) throw new BadRequest('Falta información para restablecer contraseña');

      await this.userService.forgotPassword(email);
      res.status(204).send();
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res, err, 'Ocurrió un error al solicitar restablecimiento de contraseña'
      );
    }
  }

  async resetPassword ({ body }: Request, res: Response) {
    try {
      const { token, password } = body;
      if (!token || !password) throw new BadRequest('Falta información para restablecer contraseña');

      const sesionToken = await this.userService.resetPassword(token, password);
      res.status(200).json({ message: 'Contraseña restablecida exitosamente', token: sesionToken });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al restablecer contraseña');
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
