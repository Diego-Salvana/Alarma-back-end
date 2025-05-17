import { Central, Historial, JwtPayloadExt } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { CentralDataAccess } from '../schemas';
import { NotFound } from '../utils';

export class CentralService {
   constructor (private centralDataAccess: CentralDataAccess) {}

   async getHistory (userPayload: JwtPayloadExt): Promise<Historial[]> {
      const userId = userPayload.sub;
      const houseId = userPayload.hid;

      const central = await this.centralDataAccess.getOne(userId, houseId);

      if (central === null) throw new NotFound('Central no encontrada');

      return central.historial;
   }

   async updateCode (userPayload: JwtPayloadExt, codeBody: CentralCodeDTO): Promise<void> {
      const userId = userPayload.sub;
      const houseId = userPayload.hid;

      await this.centralDataAccess.validatePasswordAndCode(userId, houseId, codeBody);

      const updatedCentral = await this.centralDataAccess.updateCode(userId, houseId, codeBody);

      if (updatedCentral === null) throw new NotFound('Central no encontrada');
   }

   async updateInfo (userPayload: JwtPayloadExt, houseId: string, infoBody: CentralInfoDTO): Promise<Central> {
      const userId = userPayload.sub;

      const updatedCentral = await this.centralDataAccess.updateInfo(userId, houseId, infoBody);

      if (updatedCentral === null) throw new NotFound('Central no encontrada');

      return updatedCentral;
   }
}
