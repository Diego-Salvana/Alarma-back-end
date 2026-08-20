import { HouseDataAccess, UserDataAccess } from '../database/models';
import { User } from '../interfaces';

export class DemoResetService {
  private userId = process.env.DEMO_USER_ID;

  constructor (
    private userDataAccess: UserDataAccess,
    private houseDataAccess: HouseDataAccess
  ) {}

  async reset () {
    if (!this.userId) {
      throw new Error('[DemoResetService] DEMO_USER_ID no encontrado en variables de entorno');
    }
  
    let user: User | undefined;
    
    try {
      user = await this.userDataAccess.getById(this.userId);
    } catch (error) {
      console.error(error);
      throw new Error('[DemoResetService] Error al obtener usuario');
    }

    if (!user) {
      throw new Error('[DemoResetService] Usuario no encontrado');
    }

    const username = user.nombreUsuario;
    const houseNames = user.casas.map(casa => casa.nombreCasa);

    const results = await Promise.allSettled(
      houseNames.map(houseName => this.houseDataAccess.updateAlarmState(username, houseName))
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[DemoResetService] Error al resetear casa:', result.reason);
      }
    }

    console.log('Resultados:', results);
  }
}
