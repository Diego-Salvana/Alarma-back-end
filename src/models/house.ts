import { merge } from 'lodash';
import { House, State } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from '.';

/** Provee acceso a la base de datos para operaciones con Casas. */
export class HouseDataAccess {
  private userModel = UserModel;
  private withoutHistory =
    '-casas.central.historial -casas.sensores.historial -casas.camaras.historial';

  /** Crea una nueva casa para un usuario, evitando nombres duplicados. */
  async create (userId: string, houseData: Omit<House, '_id'>): Promise<House> {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          casas: { $not: { $elemMatch: { nombreCasa: houseData.nombreCasa } } }
        },
        {
          $push: { casas: houseData }
        },
        { new: true }
      )
      .select(this.withoutHistory)
      .lean();

    if (user === null) {
      throw new AlreadyExists(
        `La casa ${houseData.nombreCasa} ya existe o el usuario no fue encontrado`
      );
    }

    const updatedHouse = user.casas.find(h => h.nombreCasa === houseData.nombreCasa);
    if (!updatedHouse) throw new NotFound('Casa no encontrada');

    return updatedHouse;
  }
   
  /** Obtiene todas las casas del usuario. */
  async getAllByUserId (userId: string): Promise<House[]> {
    const user = await this.userModel
      .findById(userId)
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Casas no encontradas');

    const houses = user.casas;

    return houses;
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (userId: string, houseId: string, withHistory = false): Promise<House> {
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
  async getByHouseName (username: string, houseName: string): Promise<House> {
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
  async updateHouseInfo (userId: string, houseId: string, houseBody: Partial<House>): Promise<House> {
    const house = await this.getOne(userId, houseId, true);
    if (house === null) throw new NotFound('Casa no encontrada');

    const updateBody: Partial<House> = {
      ...(houseBody.nombre && { nombre: houseBody.nombre }),
      ...(houseBody.direccion && { direccion: houseBody.direccion })
    };
      
    const updatedHouseData = merge({}, house, updateBody);

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

  async updateSystemInfo (userId: string, houseId: string, houseBody: Partial<House>): Promise<House> {
    const house = await this.getOne(userId, houseId, true);
    if (house === null) throw new NotFound('Casa no encontrada');

    const updateBody: Partial<House> = {
      nombreCasa: houseBody.nombreCasa ?? house.nombreCasa,
      central: {
        ...house.central,
        centralId: houseBody.central?.centralId ?? house.central.centralId,
        nombre: houseBody.central?.nombre ?? house.central.nombre
      },
      direccion: {
        calle: houseBody.direccion?.calle ?? house.direccion.calle,
        numero: houseBody.direccion?.numero ?? house.direccion.numero,
        ciudad: houseBody.direccion?.ciudad ?? house.direccion.ciudad
      }
    };

    const updatedHouseData = merge({}, house, updateBody);

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
  async delete (userId: string, houseId: string): Promise<void> {
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
          ? State.OFF
          : State.ON;
      });
      
      house.central.alarmaEncendida = State.ON;
    } else {
      house.central.alarmaEncendida = State.OFF;
      house.central.sonando = false;
    }

    await user.save();
  }
}
