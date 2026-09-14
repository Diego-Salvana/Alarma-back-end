import { Request, Response } from 'express';

import { HouseService, SensorService, UserService } from '../services';
import { ValidationError } from '../errors';
import { sendSuccess } from '../utils';

export class AdminController {
  constructor (
    private userService: UserService,
    private houseService: HouseService,
    private sensorService: SensorService
  ) {}

  async login ({ body }: Request, res: Response) {
    const { email, contrasena } = body;
    const responseUser = await this.userService.adminLogin(email, contrasena);

    sendSuccess(res, 200, 'Login successful', responseUser);
  }

  async getAllUsers (_req: Request, res: Response) {
    const users = await this.userService.getAllUsers();

    sendSuccess(res, 200, 'Users retrieved successfully', users);
  }

  async getUser ({ params }: Request, res: Response) {
    const { userId } = params;
    const user = await this.userService.getById(userId);

    sendSuccess(res, 200, 'User retrieved successfully', user);
  }

  async modifyUser ({ params, body }: Request, res: Response) {
    const { userId } = params;
    const user = await this.userService.updateInfoByAdmin(userId, body);

    sendSuccess(res, 200, 'User updated successfully', user);
  }

  async deleteUser ({ params }: Request, res: Response) {
    const { userId } = params;
    await this.userService.delete(userId);

    res.status(204).send();
  }

  async createHouse ({ params, body }: Request, res: Response) {
    const { userId } = params;
    await this.houseService.create(userId, body);

    sendSuccess(res, 201, 'House created successfully', null);
  }

  async modifyHouse ({ params, body }: Request, res: Response) {
    const { userId, houseId } = params;
    const house = await this.houseService.updateInfoByAdmin(userId, houseId, body);

    sendSuccess(res, 200, 'House updated successfully', house);
  }

  async deleteHouse ({ params }: Request, res: Response) {
    const { userId, houseId } = params;

    await this.houseService.delete(userId, houseId);

    res.status(204).send();
  }

  async createSensor ({ params, body }: Request, res: Response) {
    const { userId, houseId } = params;
    const newSensor = await this.sensorService.create(userId, houseId, body);

    sendSuccess(res, 201, 'Sensor added', newSensor);
  }

  async updateSensor ({ params, body }: Request, res: Response) {
    const { userId, houseId, sensorNumber } = params;
    const sensorId = parseInt(sensorNumber);

    if (isNaN(sensorId)) throw new ValidationError('Invalid sensor number');

    const updatedSensor = await this.sensorService.updateInfo(userId, houseId, sensorId, body);

    sendSuccess(res, 200, 'Sensor updated successfully', updatedSensor);
  }

  async deleteSensor ({ params }: Request, res: Response) {
    const { userId, houseId, sensorNumber } = params;
    const sensorId = parseInt(sensorNumber);

    if (isNaN(sensorId)) throw new ValidationError('Invalid sensor number');

    await this.sensorService.delete(userId, houseId, sensorId);

    res.status(204).send();
  }
}
