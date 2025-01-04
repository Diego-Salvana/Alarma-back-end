import mongoose, { Schema } from 'mongoose';
import { IUserDataAccess, IUserDocument, Login, Register, User } from '../interfaces';
import { AlreadyExists } from '../utils/custom-errors';

// Historial Schema
const HistorialSchema = new Schema(
   {
      fechaHora: { type: Date, default: Date.now }
   },
   { _id: false }
);

// Dirección Schema
const DireccionSchema = new Schema(
   {
      calle: { type: String, required: true },
      numero: { type: Number, required: true },
      ciudad: { type: String, required: true }
   },
   { _id: false }
);

// Central Schema
const CentralSchema = new Schema(
   {
      centralId: { type: String, required: true },
      nombre: { type: String, required: true },
      codigo: { type: Number, required: true },
      alarmaEncendida: { type: String, enum: ['On', 'Off'], required: true },
      activada: { type: Boolean, required: true, default: false },
      historial: [HistorialSchema]
   },
   { _id: false }
);

// Sensores y Cámaras Schema
const DispositivoSchema = new Schema(
   {
      dispositivoId: { type: String, required: true },
      numeroSensor: { type: Number, required: true },
      nombre: { type: String, required: true },
      tipo: { type: String, required: true }, // Usar enum si los tipos son fijos
      estado: { type: String, enum: ['On', 'Off'], required: true },
      historial: [HistorialSchema]
   },
   { _id: false }
);

// Casa Schema
const CasaSchema = new Schema(
   {
      nombre: { type: String, required: true, default: 'Casa' },
      nombreCasa: { type: String, required: true },
      direccion: DireccionSchema,
      central: CentralSchema,
      sensores: [DispositivoSchema],
      camaras: [DispositivoSchema]
   }
);

// Usuario Schema
const UsuarioSchema = new Schema(
   {
      nombre: { type: String, required: true },
      apellido: { type: String, required: true },
      nombreUsuario: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      contrasena: { type: String, required: true },
      mosquittoPass: { type: String, required: true },
      telefono: { type: String, required: true },
      habilitado: { type: Boolean, required: true, default: false },
      casas: [CasaSchema]
   },
   {
      timestamps: true,
      versionKey: '__v'
   }
);

// Creación de modelo
export const UserModel = mongoose.model<IUserDocument>('Usuario', UsuarioSchema);

export class UserDataAccess implements IUserDataAccess {
   private userModel = UserModel;

   async create (userBody: Register): Promise<IUserDocument> {
      let newUser: IUserDocument;

      try {
         newUser = await this.userModel.create(userBody);
      } catch (err: any) {
         console.log('Data Access: ', err);
         if (err.code === 11000) throw new AlreadyExists('El usuario ya existe');

         throw err;
      }

      return newUser;
   }

   async getOne (loginBody: Login): Promise<User | null> {
      const user: User | null = await this.userModel
         .findOne({ email: loginBody.email })
         .select('-casas.sensores.historial -casas.camaras.historial -casas.central.historial')
         .lean();

      return user;
   }

   async update (id: string, updateBody: Register): Promise<User | null> {
      let updatedUser: User | null;

      try {
         updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateBody, { new: true })
            .select('-casas.sensores.historial -casas.camaras.historial -casas.central.historial')
            .lean();
      } catch (err: any) {
         console.log('Data Access: ', err);
         if (err.code === 11000) throw new AlreadyExists(`El email ${updateBody.email} ya está en uso`);

         throw err;
      }

      return updatedUser;
   }

   async delete (id: string): Promise<User | null> {
      const user: User | null = await this.userModel.findByIdAndDelete(id);

      return user;
   }
}
