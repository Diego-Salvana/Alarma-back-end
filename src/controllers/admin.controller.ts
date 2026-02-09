import { Response } from 'express';
import { UserService } from '../services';
import { RequestExt } from '../interfaces';

export class AdminController {
  constructor (private userService: UserService) {}

  async getAllUsers ({ admin }: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async getUser (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async modifyUser (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async deleteUser (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async createHouse (req: RequestExt, res: Response) {
    // TODO: Implementar
  }
  
  async modifyHouse (req: RequestExt, res: Response) {
    // TODO: Implementar
  }

  async deleteHouse (req: RequestExt, res: Response) {
    // TODO: Implementar
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
