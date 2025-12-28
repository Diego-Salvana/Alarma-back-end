import { Central, HistorialConNombre, JwtPayloadExt } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { CentralDataAccess } from '../models';
import { NotFound } from '../utils';

export class CentralService {
   constructor (private centralDataAccess: CentralDataAccess) {}

   async getHistory (userPayload: JwtPayloadExt): Promise<HistorialConNombre[]> {
      const userId = userPayload.sub;
      const houseId = userPayload.hid;

      const house = await this.centralDataAccess.getOne(userId, houseId);

      if (house === null) throw new NotFound('Central no encontrada');

      return house.central.historial.map(history => {
         const sensorName = house.sensores.find(s => s.numeroSensor === history.numeroDispositivo)?.nombre ??
            history.numeroDispositivo.toString();
         
         const historyWithName: HistorialConNombre = { fechaHora: history.fechaHora, nombreDispositivo: sensorName };
         return historyWithName;
      });
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
