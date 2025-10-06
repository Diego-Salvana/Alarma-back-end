import { IncomingHttpHeaders } from 'http2';
import { Casa, Estado, ExcludeArrayDTO, HouseResponse, JwtPayloadExt, User } from '../interfaces';
import { HouseDataAccess, UserDataAccess } from '../schemas';
import { AlreadyExists, NotFound } from '../utils';
import { HouseDTO } from './house-dto';
import { MosquittoAccess } from '../mqtt';

export class HouseService {
  private houseDTO = new HouseDTO();

  constructor (
    private houseDataAccess: HouseDataAccess,
    private mosquittoAccess: MosquittoAccess,
    private userDataAccess: UserDataAccess
  ) {}

  async create (body: Casa, userPayload: JwtPayloadExt): Promise<void> {
    const userId = userPayload.sub;
    const houseData: Casa = { ...body, nombreCasa: body.nombre.toLowerCase().replace(/\s/g, '') };

    const user = await this.houseDataAccess.create(userId, houseData);

    if (user === null) throw new NotFound('Usuario no encontrado');
  }

  async getAll (userPayload: JwtPayloadExt): Promise<HouseResponse[]> {
    const userId = userPayload.sub;
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);

    if (allUserHouses === null) throw new NotFound('Casas no encontradas');

    return this.houseDTO.housesListResponse(allUserHouses); ;
  }

  async getOne (houseId: string, userPayload: JwtPayloadExt, headers: IncomingHttpHeaders):
  Promise<HouseResponse> {
    const userId = userPayload.sub;
    const house = await this.houseDataAccess.getOne(houseId, userId);

    if (house === null) throw new NotFound('Casa no encontrada');

    const newToken = headers['set-house'] === 'true';

    return this.houseDTO.houseResponse(house, newToken ? userId : undefined, newToken);
  }

  async update (houseId: string, userPayload: JwtPayloadExt, body: Partial<Casa>):
  Promise<HouseResponse> {
    const userId = userPayload.sub;

    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);
    const otherHouses = allUserHouses.filter(house => house._id.toString() !== houseId);

    const nameExists = otherHouses.some(h => h.nombre.trim().toLowerCase() === body.nombre?.trim().toLowerCase());

    if (nameExists) throw new AlreadyExists(`Ya existe una casa con el nombre: ${body.nombre ?? ''}`);

    const addressExists = otherHouses.some(h =>
      h.direccion.calle.trim().toLowerCase() === body.direccion?.calle.trim().toLowerCase() &&
      h.direccion.numero === body.direccion?.numero &&
      h.direccion.ciudad.trim().toLowerCase() === body.direccion?.ciudad.trim().toLowerCase()
    );

    if (addressExists) {
      throw new AlreadyExists(`Ya existe otra casa con la dirección: ${body.direccion?.calle ?? ''} ${body.direccion?.numero ?? ''}, ${body.direccion?.ciudad ?? ''}`
      );
    }

    const updatedHouse = await this.houseDataAccess.update(houseId, userId, body);

    return this.houseDTO.houseResponse(updatedHouse);
  }

  async delete (houseId: string, userPayload: JwtPayloadExt): Promise<void> {
    const userId = userPayload.sub;
      
    await this.houseDataAccess.delete(houseId, userId);
  }

  /** Publica a Mosquitto mensaje de Encendido o Apagado de alarma según los parámetros. */
  async setAlarmState (userPayload: JwtPayloadExt, state: Estado, body?: ExcludeArrayDTO): Promise<void> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;
    const exclusionArray = body?.exclusionArray ?? [];
    let user: User | null = null;
    let house: Casa | undefined;
		
    // Busca al usuario para obtener luego nombreUsuario y nombreCasa.
    try {
      user = await this.userDataAccess.getById(userId);
      if (!user) throw new Error('No se encontró usuario al activar alarma.');

      house = user.casas.find(house => house._id.toString() === houseId);
      if (!house) throw new Error('No se encontró la casa para activar alarma.');
    } catch (err: any) {
      console.log('Error al Activar alarma: ', err.message);
      this.mosquittoAccess.sendSocketError('alarmActivation', err.message);
    }

    if (!user || !house) return;
		
    const userName = user.nombreUsuario;
    const houseName = house.nombreCasa;
    const excludedSensors = exclusionArray.reduce<string[]>((acum, sensor) => {
      if (sensor.estado !== 'On') acum.push(sensor.numeroSensor.toString());
      return acum;
    }, []).join(',');

    this.mosquittoAccess.publicMessage(
      'alarmActivation', `${state}/${excludedSensors}`, userName, houseName
    );
  }
}
