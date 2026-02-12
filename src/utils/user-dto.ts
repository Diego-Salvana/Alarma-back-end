import { House, HouseResponse, LoginResponse, ProfileResponse, User } from '../interfaces';

/** Provee transformaciones de usuario a respuestas de autenticación y perfil. */
export class UserDto {
  /** Transforma un usuario en una respuesta de autenticación con token y casas. */
  loginResponse (user: User, token: string): LoginResponse {
    const casasResponse: HouseResponse[] = this.housesMap(user.casas);

    const responseUser: LoginResponse = {
      nombre: user.nombre,
      email: user.email,
      habilitado: user.habilitado,
      casas: casasResponse,
      token
    };

    return responseUser;
  }

  /** Transforma un usuario en una respuesta de perfil con casas. */
  profileResponse (user: User): ProfileResponse {
    const casasResponse: HouseResponse[] = this.housesMap(user.casas);

    const userProfile: ProfileResponse = {
      _id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      telefono: user.telefono,
      habilitado: user.habilitado,
      casas: casasResponse
    };

    return userProfile;
  };

  /** Transforma un arreglo de `Casa` a un arreglo de `HouseResponse`. */
  private housesMap (houses: House[]): HouseResponse[] {
    return houses.map(casa => ({
      _id: casa._id,
      nombre: casa.nombre,
      nombreCasa: casa.nombreCasa,
      direccion: casa.direccion,
      alarmaEncendida: casa.central.alarmaEncendida,
      sonando: casa.central.sonando
    }));
  }
}
