import { Casa, HouseResponse, IUserDocument, LoginResponse, ProfileResponse, User } from '../interfaces';
import { JWTHandler } from '../utils';

/** Provee transformaciones de usuario a respuestas de autenticación y perfil. */
export class UserDTO {
  /** Transforma un usuario en una respuesta de autenticación con token y casas. */
  loginResponse (user: IUserDocument | User): LoginResponse {
    const token = JWTHandler.generateToken({
      userId: user._id as string,
      houseId: user.casas[0] ? user.casas[0]._id : ''
    });

    const casasResponse: HouseResponse[] = this.housesMap(user.casas);

    const responseUser: LoginResponse = {
      nombre: user.nombre,
      email: user.email,
      habilitado: user.habilitado,
      token,
      casas: casasResponse
    };

    return responseUser;
  }

  /** Transforma un usuario en una respuesta de perfil con casas. */
  profileResponse (user: IUserDocument | User): ProfileResponse {
    const casasResponse: HouseResponse[] = this.housesMap(user.casas);

    const userProfile: ProfileResponse = {
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      habilitado: user.habilitado,
      casas: casasResponse
    };

    return userProfile;
  };

  /** Transforma un arreglo de `Casa` a un arreglo de `HouseResponse`. */
  private housesMap (houses: Casa[]): HouseResponse[] {
    return houses.map(casa => ({
      _id: casa._id.toString(),
      nombre: casa.nombre,
      nombreCasa: casa.nombreCasa,
      direccion: casa.direccion,
      alarmaEncendida: casa.central.alarmaEncendida,
      sonando: casa.central.sonando
    }));
  }
}
