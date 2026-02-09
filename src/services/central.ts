import { Central, HistorialConNombre, SessionJwtPayload, CentralCodeDTO, CentralInfoDTO } from '../interfaces';
import { CentralDataAccess, UserDataAccess } from '../models';
import { NotFound, Unauthorized, verifyPass } from '../utils';

export class CentralService {
  constructor (
    private userDataAccess: UserDataAccess,
    private centralDataAccess: CentralDataAccess
  ) {}

  /** Obtiene el historial de eventos de la Central y mapea los dispositivos a nombres descriptivos. */
  async getHistory (userPayload: SessionJwtPayload): Promise<HistorialConNombre[]> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid ?? '';
    const house = await this.centralDataAccess.getOne(userId, houseId);

    return house.central.historial.map(history => {
      const sensor = house.sensores.find(s => s.numeroSensor === history.numeroDispositivo);
      const sensorName = sensor?.nombre ?? history.numeroDispositivo.toString();
         
      const historyWithName: HistorialConNombre = {
        fechaHora: history.fechaHora,
        nombreDispositivo: sensorName
      };

      return historyWithName;
    });
  }

  /** Actualiza el código de la central para una casa del usuario tras validaciones de identidad y credenciales. */
  async updateCode (userPayload: SessionJwtPayload, codeBody: CentralCodeDTO): Promise<void> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid ?? '';
    const user = await this.userDataAccess.getById(userId);

    const passwordIsCorrect = await verifyPass(codeBody.contrasena, user.contrasena);
    if (!passwordIsCorrect) throw new Unauthorized('Contraseña de usuario incorrecta.');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const centralCode = house?.central.codigo;
    if (!centralCode) throw new NotFound('Código de alarma no encontrados para validación.');
    
    if (centralCode !== codeBody.codigoActual) throw new Unauthorized('Código de alarma actual incorrecto.');
    
    await this.centralDataAccess.updateCode(userId, houseId, codeBody);
  }

  /** Actualiza la información de la central en la casa del usuario. */
  async updateInfo (userPayload: SessionJwtPayload, houseId: string, infoBody: CentralInfoDTO): Promise<Central> {
    const userId = userPayload.sub;
    const updatedCentral = await this.centralDataAccess.updateInfo(userId, houseId, infoBody);

    return updatedCentral;
  }
}
