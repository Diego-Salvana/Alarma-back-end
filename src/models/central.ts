import { Casa, Central, HistorialCentral } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { NotFound } from '../utils';
import { UserModel } from '.';

export class CentralDataAccess {
  private userModel = UserModel;
  private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
  private noCentralHistory = '-casas.central.historial';

  async getOne (userId: string, houseId: string): Promise<Casa> {
    const user = await this.userModel
      .findOne({ _id: userId, 'casas._id': houseId })
      .select(this.noSensorsHistory)
      .lean();

    if (user === null) throw new NotFound('Usuario o casa no encontrados');

    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');

    return house;
  }

  /** Actualiza el código de la central de una casa en la BD y devuelve la central actualizada. */
  async updateCode (userId: string, houseId: string, codeBody: CentralCodeDTO): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId, 'casas._id': houseId },
      { $set: { 'casas.$.central.codigo': codeBody.nuevoCodigo } }
    );

    if (result.matchedCount === 0) throw new NotFound('Usuario o casa no encontrados');
  }

  /** Actualiza la información de la central de una casa en la BD */
  async updateInfo (userId: string, houseId: string, infoBody: CentralInfoDTO): Promise<Central> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'casas._id': houseId },
        {
          $set: {
            'casas.$.central.centralId': infoBody.centralId,
            'casas.$.central.nombre': infoBody.nombre
          }
        },
        { new: true }
      )
      .select(`${this.noSensorsHistory} ${this.noCentralHistory}`)
      .lean();
    
    if (user === null) throw new NotFound('Usuario o casa no encontrados');
    
    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');
   
    return house.central;
  }

  /** Actualiza el estado de la sirena en una Casa en la BD. */
  async updateSirenState (username: string, houseName: string, ringing: boolean): Promise<void> {
    const result = await this.userModel.updateOne(
      { nombreUsuario: username, 'casas.nombreCasa': houseName },
      { $set: { 'casas.$.central.sonando': ringing } }
    );
  
    if (result.matchedCount === 0) throw new NotFound('Usuario o casa no encontrados');
  }

  /** Actualiza el historial de una central en una casa específica. */
  async addToHistory (userName: string, houseName: string, sensorNumber: number, date: Date): Promise<void> {
    const utcDate = new Date(date.toISOString());
    const activationDate: HistorialCentral = { fechaHora: utcDate, numeroDispositivo: sensorNumber };
    const result = await this.userModel.updateOne(
      { nombreUsuario: userName, 'casas.nombreCasa': houseName },
      {
        $push: { 'casas.$.central.historial': { $each: [activationDate], $position: 0 } }
      }
    );
      
    if (result.matchedCount === 0) throw new NotFound('Usuario o casa no encontrados');
  }
}
