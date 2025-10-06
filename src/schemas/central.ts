import { Casa, Central, Estado, HistorialCentral } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { NotFound, Unauthorized, verify } from '../utils';
import { UserModel } from './user';

export class CentralDataAccess {
	private userModel = UserModel;
	private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
	private noCentralHistory = '-casas.central.historial';

	async getOne (userId: string, houseId: string): Promise<Casa | null> {
		const user = await this.userModel
			.findOne({ _id: userId, 'casas._id': houseId })
			.select(this.noSensorsHistory)
			.lean();

		if (user === null) throw new NotFound('Usuario o casa no encontrados');

		const house = user.casas.find(h => h._id.toString() === houseId);

		return house ?? null;
	}

	async updateCode (userId: string, houseId: string, codeBody: CentralCodeDTO): Promise<Central | null> {
		const user = await this.userModel
			.findOneAndUpdate(
				{ _id: userId, 'casas._id': houseId },
				{ $set: { 'casas.$.central.codigo': codeBody.nuevoCodigo } },
				{ new: true }
			)
			.select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

		if (user === null) throw new NotFound('Usuario o casa no encontrados');
      
		const house = user.casas.find(h => h._id.toString() === houseId);
   
		return house?.central ?? null;
	}

	async validatePasswordAndCode (userId: string, houseId: string, codeBody: CentralCodeDTO): Promise<void> {
		const user = await this.userModel
			.findOne({ _id: userId, 'casas._id': houseId })
			.select('-casas.central.historial -casas.sensores')
			.lean();

		if (user === null) throw new NotFound('Usuario o casa no encontrados para validación.');

		const passwordIsCorrect = await verify(codeBody.contrasena, user.contrasena ?? '');
		if (!passwordIsCorrect) throw new Unauthorized('Contraseña de usuario incorrecta.');

		const house = user.casas.find(h => h._id.toString() === houseId);
		if (house?.central?.codigo === undefined) throw new NotFound('Central o código de alarma no encontrados para validación.');

		if (house.central.codigo !== codeBody.codigoActual) throw new Unauthorized('Código de alarma actual incorrecto.');
	}

	async updateInfo (userId: string, houseId: string, infoBody: CentralInfoDTO): Promise<Central | null> {
		const user = await this.userModel
			.findOneAndUpdate(
				{ _id: userId, 'casas._id': houseId },
				{
					$set: {
						'casas.$.central.centralId': infoBody.centralId,
						'casas.$.central.nombre': infoBody.nombre
					}
				},
				{ new: true }
			)
			.select(`${this.noSensorsHistory} ${this.noCentralHistory}`);
      
		const house = user?.casas.find(h => h._id.toString() === houseId);
   
		return house?.central ?? null;
	}

	async updateState (userName: string, houseName: string, state: Estado): Promise<Casa | null> {
		const user = await this.userModel
			.findOneAndUpdate(
				{ nombreUsuario: userName, 'casas.nombreCasa': houseName },
				{ $set: { 'casas.$.central.alarmaEncendida': state, 'casas.$.central.sonando': 'false' } },
				{ new: true }
			)
			.select(`${this.noSensorsHistory} ${this.noCentralHistory}`)
			.lean();
      
		if (user === null) throw new NotFound('Usuario o casa no encontrados');

		const house = user.casas.find(house => house.nombreCasa === houseName);
      
		return house ?? null;
	}

	async setActivation (userName: string, houseName: string, sensorNumber: number, date: Date): Promise<void> {
		const utcDate = new Date(date.toISOString());
		const activationDate: HistorialCentral = { fechaHora: utcDate, numeroDispositivo: sensorNumber };

		const user = await this.userModel
			.findOneAndUpdate(
				{ nombreUsuario: userName, 'casas.nombreCasa': houseName },
				{
					$set: { 'casas.$.central.sonando': 'true' },
					$push: { 'casas.$.central.historial': { $each: [activationDate], $position: 0 } }
				},
				{ new: true }
			)
			.select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

		if (user === null) throw new NotFound('Usuario o casa no encontrados');
	}
}
