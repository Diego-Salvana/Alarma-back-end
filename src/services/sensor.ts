import { Casa, JwtPayloadExt, LoginResponse } from '../interfaces';
import { HouseDataAccess, SensorDataAccess } from '../schemas';
import { NotFound } from '../utils';
import { UserDTO } from './user-dto';

export class SensorService {
   private userDTO = new UserDTO();

   constructor (private sensorDataAccess: SensorDataAccess) {}

   // async create (body: any, userPayload: JwtPayloadExt): Promise<LoginResponse> {
   //    const userId = userPayload.sub as string;
   //    const user = await this.houseDataAccess.create(userId, body);

   //    if (user === null) throw new NotFound('Usuario no encontrado');

   //    return this.userDTO.loginResponse(user);
   // }

   // async getOne (houseId: string, userPayload: JwtPayloadExt): Promise<Casa> {
   //    const userId = userPayload.sub as string;
   //    const house = await this.houseDataAccess.getOne(houseId, userId);

   //    if (house === null) throw new NotFound('Casa no encontrada');

   //    return house;
   // }

   // async update (houseId: string, userPayload: JwtPayloadExt, body: Casa): Promise<Casa> {
   //    const userId = userPayload.sub as string;

   //    const updatedHouse = await this.houseDataAccess.update(houseId, userId, body);

   //    return updatedHouse;
   // }

   // async delete (houseId: string, userPayload: JwtPayloadExt): Promise<void> {
   //    const userId = userPayload.sub as string;
      
   //    await this.houseDataAccess.delete(houseId, userId);
   // }
}
