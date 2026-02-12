import { House, HouseResponse } from '../interfaces';
import { JwtHandler } from '.';

/** Clase que contiene métodos para transformar datos de Casas en objetos DTO. */
export class HouseDto {
  /** Transforma datos de una Casa en un objeto HouseResponse. */
  houseResponse (house: House, newToken = false, userId?: string, verified = false): HouseResponse {
    let token: string | undefined;

    if (newToken && userId) {
      token = JwtHandler.generateUserIdToken(userId, verified, house._id);
    }

    const houseData: HouseResponse = {
      _id: house._id,
      nombre: house.nombre,
      nombreCasa: house.nombreCasa,
      direccion: house.direccion,
      alarmaEncendida: house.central.alarmaEncendida,
      sonando: house.central.sonando,
      sensores: house.sensores,
      token
    };

    return houseData;
  }

  /** Transforma datos de una lista de Casas en un array de HouseResponse. */
  housesListResponse (casas: House[]): HouseResponse[] {
    return casas.map(casa => ({
      _id: casa._id.toString(),
      nombre: casa.nombre,
      nombreCasa: casa.nombreCasa,
      direccion: casa.direccion,
      alarmaEncendida: casa.central.alarmaEncendida
    }));
  }
}
