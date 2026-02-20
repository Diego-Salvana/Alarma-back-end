import { Request, Response } from 'express';
import { HouseService, SensorService, UserService } from '../services';
import { BadRequest, ErrorHandler } from '../utils';

export class AdminController {
  constructor (
    private userService: UserService,
    private houseService: HouseService,
    private sensorService: SensorService
  ) {}

  async login ({ body }: Request, res: Response) {
    try {
      const { email, contrasena } = body;
      const responseUser = await this.userService.adminLogin(email, contrasena);

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

      res.status(204).send();
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al eliminar el usuario');
    }
  }

  async createHouse ({ params, body }: Request, res: Response) {
    try {
      const { userId } = params;
      const house = await this.houseService.create(userId, body);

      res.status(201).json({ message: 'Casa creada exitosamente', data: house });
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

      res.status(204).send();
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al eliminar la casa');
    }
  }

  async createSensor ({ params, body }: Request, res: Response) {
    try {
      const { userId, houseId } = params;
      const newSensor = await this.sensorService.create(userId, houseId, body);

      res.status(201).json({ message: 'Sensor agregado', data: newSensor });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear el sensor');
    }
  }

  async updateSensor ({ params, body }: Request, res: Response) {
    try {
      const { userId, houseId, sensorNumber } = params;
      const sensorId = parseInt(sensorNumber);
      
      if (isNaN(sensorId)) throw new BadRequest('El número de sensor no es válido');

      const updatedSensor = await this.sensorService.updateInfo(userId, houseId, sensorId, body);

      res.status(200).json({ message: 'Sensor modificado', data: updatedSensor });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear el sensor');
    }
  }

  async deleteSensor ({ params }: Request, res: Response) {
    try {
      const { userId, houseId, sensorNumber } = params;
      const sensorId = parseInt(sensorNumber);
      
      if (isNaN(sensorId)) throw new BadRequest('El número de sensor no es válido');

      await this.sensorService.delete(userId, houseId, sensorId);

      res.status(204).send();
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear el sensor');
    }
  }
}
