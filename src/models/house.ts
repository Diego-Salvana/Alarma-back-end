import { merge } from 'lodash';
import { Casa, Estado } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from '.';

/** Provee acceso a la base de datos para operaciones con Casas. */
export class HouseDataAccess {
  private userModel = UserModel;
  private withoutHistory =
    '-casas.central.historial -casas.sensores.historial -casas.camaras.historial';

  /** Crea una nueva casa para un usuario, evitando nombres duplicados. */
  async create (userId: string, house: Casa): Promise<Casa> {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          casas: { $not: { $elemMatch: { nombreCasa: house.nombreCasa } } }
        },
        {
          $push: { casas: house }
        },
        { new: true }
      )
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new AlreadyExists(`La casa ${house.nombreCasa} ya existe o el usuario no fue encontrado`);

    const updatedHouse = user.casas.find(h => h.nombreCasa === house.nombreCasa);
    if (!updatedHouse) throw new NotFound('Casa no encontrada');

    return updatedHouse;
  }
   
  /** Obtiene todas las casas del usuario. */
  async getAllByUserId (userId: string): Promise<Casa[]> {
    const user = await this.userModel
      .findById(userId)
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Casas no encontradas');

    const houses = user.casas;

    return houses;
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (houseId: string, userId: string, withHistory = false): Promise<Casa> {
    const user = await this.userModel
      .findOne({ _id: userId, 'casas._id': houseId })
      .select(withHistory ? '' : this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Casa no encontrada');
      
    const house = user.casas.find(house => house._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');
      
    return house;
  }

  /** Obtiene una casa específica del usuario por su houseName. */
  async getByHouseName (username: string, houseName: string): Promise<Casa> {
    const user = await this.userModel
      .findOne({ nombreUsuario: username, 'casas.nombreCasa': houseName })
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Casa no encontrada');
      
    const house = user.casas.find(house => house.nombreCasa === houseName);
    if (!house) throw new NotFound('Casa no encontrada');
    
    return house;
  }

  /** Actualiza una casa específica del usuario. */
  async updateHouseInfo (houseId: string, userId: string, houseBody: Partial<Casa>): Promise<Casa> {
    const house = await this.getOne(houseId, userId, true);
    if (house === null) throw new NotFound('Casa no encontrada');
      
    const updatedHouseData = merge({}, house, houseBody);

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'casas._id': houseId },
        { $set: { 'casas.$': updatedHouseData } },
        { new: true }
      )
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Usuario o casa no encontrados durante la actualización');
    
    const responseHouse = user.casas.find(house => house._id.toString() === houseId);
    if (!responseHouse) throw new NotFound('Casa no encontrada después de la actualización');
    
    return responseHouse;
  }

  /** Elimina una casa del usuario. */
  async delete (houseId: string, userId: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId, 'casas._id': houseId },
      { $pull: { casas: { _id: houseId } } }
    );

    if (result.matchedCount === 0) throw new NotFound('Casa no encontrada');
  }

  /** Actualiza el ``estado`` de la Alarma y sus Sensores en una Casa en la BD. */
  async updateAlarmState (username: string, houseName: string, exclusionArray?: string[]):
  Promise<void> {
    const user = await this.userModel
      .findOne({ nombreUsuario: username, 'casas.nombreCasa': houseName })
      .select(this.withoutHistory);

    if (user === null) throw new NotFound('Usuario no encontrado');

    const house = user.casas.find(h => h.nombreCasa === houseName);
    if (!house) throw new NotFound('Casa no encontrada');

    if (exclusionArray) {
      house.sensores.forEach(sensor => {
        sensor.estado = exclusionArray.includes(sensor.numeroSensor.toString())
          ? Estado.APAGADO
          : Estado.ENCENDIDO;
      });
      
      house.central.alarmaEncendida = Estado.ENCENDIDO;
    } else {
      house.central.alarmaEncendida = Estado.APAGADO;
      house.central.sonando = false;
    }

    await user.save();
  }
}
