import { EventLogWithName, CentralCodeDTO } from '../interfaces';
import { CentralDataAccess, UserDataAccess } from '../database/models';
import { verifyPass } from '../utils';
import { NotFoundError, UnauthorizedError } from '../errors';

export class CentralService {
  constructor (
    private userDataAccess: UserDataAccess,
    private centralDataAccess: CentralDataAccess
  ) {}

  /** Obtiene el historial de eventos de la Central y mapea los dispositivos a nombres descriptivos. */
  async getHistory (userId: string, houseId: string): Promise<EventLogWithName[]> {
    const house = await this.centralDataAccess.getOne(userId, houseId);

    return house.central.historial.map(history => {
      const sensor = house.sensores.find(s => s.numeroSensor === history.numeroDispositivo);
      const sensorName = sensor?.nombre ?? history.numeroDispositivo.toString();
         
      const historyWithName: EventLogWithName = {
        fechaHora: history.fechaHora,
        nombreDispositivo: sensorName
      };

      return historyWithName;
    });
  }

  /** Actualiza el código de la central para una casa del usuario tras validaciones de identidad y credenciales. */
  async updateCode (userId: string, houseId: string, codeBody: CentralCodeDTO): Promise<void> {
    const user = await this.userDataAccess.getById(userId);
    const { contrasena, codigoActual, nuevoCodigo } = codeBody;

    const passwordIsCorrect = await verifyPass(contrasena, user.contrasena);
    if (!passwordIsCorrect) throw new UnauthorizedError('Incorrect user password');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const centralCode = house?.central.codigo;

    if (!centralCode) throw new NotFoundError('Alarm code not found for validation');
    if (centralCode !== codigoActual) throw new UnauthorizedError('Current alarm code is incorrect');
    
    await this.centralDataAccess.updateCode(userId, houseId, nuevoCodigo);
  }
}
