import { Central, JwtPayloadExt } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { CentralDataAccess } from '../schemas';
import { NotFound } from '../utils';

export class CentralService {
   constructor (private centralDataAccess: CentralDataAccess) {}

   async getOne (userPayload: JwtPayloadExt, houseId: string): Promise<Central> {
      const userId = userPayload.sub as string;

      const central = await this.centralDataAccess.getOne(userId, houseId);

      if (central === null) throw new NotFound('Central no encontrada');

      return central;
   }

   async updateCode (userPayload: JwtPayloadExt, houseId: string, codeBody: CentralCodeDTO): Promise<Central> {
      const userId = userPayload.sub as string;
      const code = codeBody.codigo;

      const updatedCentral = await this.centralDataAccess.updateCode(userId, houseId, code);

      if (updatedCentral === null) throw new NotFound('Central no encontrada');

      return updatedCentral;
   }

   async updateInfo (userPayload: JwtPayloadExt, houseId: string, infoBody: CentralInfoDTO): Promise<Central> {
      const userId = userPayload.sub as string;

      const updatedCentral = await this.centralDataAccess.updateInfo(userId, houseId, infoBody);

      if (updatedCentral === null) throw new NotFound('Central no encontrada');

      return updatedCentral;
   }
}
