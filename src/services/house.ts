import { Casa, HouseResponse, JwtPayloadExt } from '../interfaces';
import { HouseDataAccess } from '../schemas';
import { AlreadyExists, NotFound } from '../utils';
import { HouseDTO } from './house-dto';

export class HouseService {
   private houseDTO = new HouseDTO();

   constructor (private houseDataAccess: HouseDataAccess) {}

   async create (body: Casa, userPayload: JwtPayloadExt): Promise<void> {
      const userId = userPayload.sub;
      const houseData: Casa = { ...body, nombreCasa: body.nombre.toLowerCase().replace(/\s/g, '') };

      const user = await this.houseDataAccess.create(userId, houseData);

      if (user === null) throw new NotFound('Usuario no encontrado');
   }

   async getAll (userPayload: JwtPayloadExt): Promise<HouseResponse[]> {
      const userId = userPayload.sub;
      const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);

      if (allUserHouses === null) throw new NotFound('Casas no encontradas');

      return this.houseDTO.housesListResponse(allUserHouses); ;
   }

   async getOne (houseId: string, userPayload: JwtPayloadExt): Promise<HouseResponse> {
      const userId = userPayload.sub;
      const house = await this.houseDataAccess.getOne(houseId, userId);

      if (house === null) throw new NotFound('Casa no encontrada');

      return this.houseDTO.houseResponse(house);
   }

   async update (houseId: string, userPayload: JwtPayloadExt, body: Partial<Casa>): Promise<HouseResponse> {
      const userId = userPayload.sub;

      const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);
      const otherHouses = allUserHouses.filter(house => house._id.toString() !== houseId);

      const nameExists = otherHouses.some(h => h.nombre.trim().toLowerCase() === body.nombre?.trim().toLowerCase());

      if (nameExists) throw new AlreadyExists(`Ya existe una casa con el nombre: ${body.nombre ?? ''}`);

      const addressExists = otherHouses.some(h =>
         h.direccion.calle.trim().toLowerCase() === body.direccion?.calle.trim().toLowerCase() &&
         h.direccion.numero === body.direccion?.numero &&
         h.direccion.ciudad.trim().toLowerCase() === body.direccion?.ciudad.trim().toLowerCase()
      );

      if (addressExists) {
         throw new AlreadyExists(`Ya existe otra casa con la dirección: ${body.direccion?.calle ?? ''} ${body.direccion?.numero ?? ''}, ${body.direccion?.ciudad ?? ''}`
         );
      }

      const updatedHouse = await this.houseDataAccess.update(houseId, userId, body);

      return this.houseDTO.houseResponse(updatedHouse);
   }

   async delete (houseId: string, userPayload: JwtPayloadExt): Promise<void> {
      const userId = userPayload.sub;
      
      await this.houseDataAccess.delete(houseId, userId);
   }
}
