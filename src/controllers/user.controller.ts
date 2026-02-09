import { Request, Response } from 'express';
import { UserService } from '../services';
import { RequestExt, SessionJwtPayload, VerificationJwtPayload } from '../interfaces';
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

  async sendVerificationEmail ({ body }: Request, res: Response) {
    try {
      const { email } = body;
      if (!email) throw new BadRequest('Falta información para enviar correo de verificación');

      await this.userService.sendVerificationEmail(email);
      res.status(204).send();
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al enviar correo de verificación');
    }
  }

  async verifyEmail ({ verificationToken }: RequestExt, res: Response) {
    try {
      const { username, purpose } = verificationToken as VerificationJwtPayload;
      const sessionToken = await this.userService.verifyEmail(username, purpose);

      res.status(200).json({ message: 'Verificación exitosa', token: sessionToken });
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

  async resetPassword ({ body, verificationToken }: RequestExt, res: Response) {
    try {
      const { username, purpose } = verificationToken as VerificationJwtPayload;
      const { password } = body;

      if (!password) throw new BadRequest('Falta información para restablecer contraseña');

      const sessionToken = await this.userService.resetPassword(username, purpose, password);

      res.status(200).json({ message: 'Contraseña restablecida exitosamente', token: sessionToken });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al restablecer contraseña');
    }
  }

  async getById ({ user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;

    try {
      const responseUser = await this.userService.getById(sub);
      res.status(200).json({ message: 'Get by id successfully', data: responseUser });
    } catch (e) {
      ErrorHandler.generateResponse(res, e, 'Ocurrió un error al obtener usuario');
    }
  }

  async update ({ body, user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;

    try {
      const responseUser = await this.userService.update(sub, body);
      res.status(200).json({ message: 'Updated successfully', data: responseUser });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar usuario');
    }
  }
}
