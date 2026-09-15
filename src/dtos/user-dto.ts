import { House, HouseResponse, LoginResponse, ProfileResponse, User } from '../interfaces';

export class UserDto {
  /** Transforma un usuario en una respuesta de autenticación con token y casas. */
  loginResponse (user: User, token: string, houses: House[] = []): LoginResponse {
    const housesResponse: HouseResponse[] = this.housesMap(houses);

    const responseUser: LoginResponse = {
      firstName: user.firstName,
      email: user.email,
      enabled: user.enabled,
      houses: housesResponse,
      token
    };

    return responseUser;
  }

  /** Transforma un usuario en una respuesta de perfil con casas. */
  profileResponse (user: User, houses: House[] = []): ProfileResponse {
    const housesResponse: HouseResponse[] = this.housesMap(houses);

    const userProfile: ProfileResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      enabled: user.enabled,
      houses: housesResponse
    };

    return userProfile;
  };

  /** Transforma un arreglo de casas a un arreglo de HouseResponse. */
  private housesMap (houses: House[]): HouseResponse[] {
    return houses.map(house => ({
      _id: house._id,
      name: house.name,
      houseName: house.houseName,
      address: house.address,
      alarmState: house.controlPanel.alarmState,
      ringing: house.controlPanel.ringing
    }));
  }
}
