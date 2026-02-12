import { Request, Response } from 'express';
import { HouseService, UserService } from '../services';
import { RequestExt } from '../interfaces';
import { ErrorHandler } from '../utils';

export class AdminController {
  constructor (private userService: UserService, private houseService: HouseService) {}

  async login ({ body }: Request, res: Response) {
    try {
      const responseUser = await this.userService.adminLogin(body);

      res.status(200).json({ message: 'Inicio de sesión exitoso', data: responseUser });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al iniciar sesión');
    }
  }

  async getAllUsers (req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({ message: 'Usuarios obtenidos exitosamente', data: users });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener los usuarios');
    }
  }

  async getUser ({ params }: Request, res: Response) {
    try {
      const { userId } = params;
      const user = await this.userService.getById(userId);

      res.status(200).json({ message: 'Usuario obtenido exitosamente', data: user });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener el usuario');
    }
  }

  async modifyUser ({ params, body }: Request, res: Response) {
    try {
      const { userId } = params;
      const user = await this.userService.updateInfoByAdmin(userId, body);

      res.status(200).json({ message: 'Usuario modificado exitosamente', data: user });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al modificar el usuario');
    }
  }

  async deleteUser ({ params }: Request, res: Response) {
    try {
      const { userId } = params;
      await this.userService.delete(userId);

      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al eliminar el usuario');
    }
  }

  async createHouse ({ params, body }: Request, res: Response) {
    try {
      const { userId } = params;
      const house = await this.houseService.create(userId, body);

      res.status(200).json({ message: 'Casa creada exitosamente', data: house });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear la casa');
    }
  }
  
  async modifyHouse ({ params, body }: Request, res: Response) {
    try {
      const { userId, houseId } = params;
      const house = await this.houseService.updateInfoByAdmin(userId, houseId, body);

      res.status(200).json({ message: 'Casa modificada exitosamente', data: house });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al modificar la casa');
    }
  }

  async deleteHouse ({ params }: Request, res: Response) {
    try {
      const { userId, houseId } = params;
      await this.houseService.delete(userId, houseId);

      res.status(200).json({ message: 'Casa eliminada exitosamente' });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al eliminar la casa');
    }
  }

  async createSensor (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async updateSensor (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async deleteSensor (req: RequestExt, res: Response) {
    // TODO: Implementar
  }
}
