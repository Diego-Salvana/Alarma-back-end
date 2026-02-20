import { EventLogWithName, CentralCodeDTO } from '../interfaces';
import { CentralDataAccess, UserDataAccess } from '../models';
import { NotFound, Unauthorized, verifyPass } from '../utils';

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
    if (!passwordIsCorrect) throw new Unauthorized('Contraseña de usuario incorrecta.');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const centralCode = house?.central.codigo;

    if (!centralCode) throw new NotFound('Código de alarma no encontrados para validación.');
    if (centralCode !== codigoActual) throw new Unauthorized('Código actual de alarma incorrecto.');
    
    await this.centralDataAccess.updateCode(userId, houseId, nuevoCodigo);
  }
}
