import { merge } from 'lodash';
import { Casa, Estado, User } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from '.';

/** Provee acceso a la base de datos para operaciones con Casas. */
export class HouseDataAccess {
  private userModel = UserModel;
  private withoutHistory =
    '-casas.central.historial -casas.sensores.historial -casas.camaras.historial';

  /** Crea una nueva casa para un usuario, evitando nombres duplicados. */
  async create (userId: string, house: Casa): Promise<User | null> {
    const user = await this.userModel.findOne({ _id: userId, 'casas.nombre': house.nombre });

    if (user !== null) throw new AlreadyExists(`Ya existe una casa con el nombre: ${house.nombre}`);

    const userNewHouse: User | null = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { casas: house } },
        { new: true }
      )
      .select(this.withoutHistory)
      .lean();
      
    return userNewHouse;
  }
   
  /** Obtiene todas las casas del usuario. */
  async getAllByUserId (
    userId: string
  ): Promise<Array<Pick<Casa, '_id' | 'nombre' | 'nombreCasa' | 'direccion' | 'central'>>> {
    const user = await this.userModel
      .findById(userId)
      .select('casas._id casas.nombre casas.direccion casas.central.alarmaEncendida')
      .lean();

    if (user === null) throw new NotFound('Casas no encontradas');

    const houses = user.casas.map(casa => ({
      _id: casa._id.toString(),
      nombre: casa.nombre,
      nombreCasa: casa.nombreCasa,
      direccion: casa.direccion,
      central: casa.central
    }));
      
    return houses;
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (houseId: string, userId: string, withHistory = false): Promise<Casa | null> {
    const user = await this.userModel
      .findOne({ _id: userId, 'casas._id': houseId })
      .select(withHistory ? '' : this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Casa no encontrada');
      
    const house = user.casas.find(house => house._id.toString() === houseId);
      
    return house ?? null;
  }

  /** Actualiza una casa específica del usuario. */
  async update (houseId: string, userId: string, houseBody: Partial<Casa>): Promise<Casa> {
    const house = await this.getOne(houseId, userId, true);

    if (house === null) throw new NotFound('Casa no encontrada');
      
    const updatedHouseData = merge({}, house, houseBody);

    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, 'casas._id': houseId },
      { $set: { 'casas.$': updatedHouseData } },
      { new: true }
    ).select(this.withoutHistory).lean();

    if (user === null) {
      throw new NotFound('Usuario o casa no encontrados durante la actualización');
    }
    
    const responseHouse = user.casas.find(house => house._id.toString() === houseId);

    if (responseHouse === undefined) {
      throw new NotFound('Casa no encontrada después de la actualización');
    }
    
    return responseHouse;
  }

  /** Elimina una casa del usuario. */
  async delete (houseId: string, userId: string): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, 'casas._id': houseId },
      { $pull: { casas: { _id: houseId } } },
      { new: true }
    );

    if (user === null) throw new NotFound('Casa no encontrada');
  }

  /** Actualiza el ``estado`` de la Alarma y sus Sensores en una Casa en la BD. */
  async updateAlarmState (username: string, houseName: string, exclusionArray?: string[]):
  Promise<void> {
    const user = await this.userModel
      .findOne({ nombreUsuario: username, 'casas.nombreCasa': houseName })
      .select(this.withoutHistory);

    if (user === null) throw new NotFound('Usuario no encontrado');

    const house = user.casas.find(h => h.nombreCasa === houseName);
    if (house === undefined) throw new NotFound('Casa no encontrada');

    if (exclusionArray) {
      house.sensores.forEach(sensor => {
        sensor.estado = exclusionArray.includes(sensor.numeroSensor.toString())
          ? Estado.APAGADO
          : Estado.ENCENDIDO;
      });
      
      house.central.alarmaEncendida = Estado.ENCENDIDO;
    } else {
      house.central.alarmaEncendida = Estado.APAGADO;
    }

    await user.save();
  }

  /** Actualiza la propiedad `central.sonando` en una Casa en la BD. */
  async updateCentralRinging (username: string, houseName: string, ringing: boolean): Promise<void> {
    const user = await this.userModel
      .findOne({ nombreUsuario: username, 'casas.nombreCasa': houseName })
      .select(this.withoutHistory);

    if (user === null) throw new NotFound('Usuario no encontrado');

    const house = user.casas.find(h => h.nombreCasa === houseName);
    if (house === undefined) throw new NotFound('Casa no encontrada');

    house.central.sonando = ringing;

    await user.save();
  }
}
