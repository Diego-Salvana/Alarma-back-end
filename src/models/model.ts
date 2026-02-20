import mongoose, { Schema } from 'mongoose';
import { User } from '../interfaces';

// Historial Dispositivo Schema
const HistorialSchema = new Schema(
  {
    fechaHora: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Historial Central Schema
const HistorialCentralSchema = new Schema(
  {
    fechaHora: { type: Date, default: Date.now },
    numeroDispositivo: { type: Number, required: true }
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
    sonando: { type: Boolean, required: true, default: false },
    historial: [HistorialCentralSchema]
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
    estado: {
      type: String,
      enum: ['On', 'Off'],
      required: true,
      default: 'On'
    },
    historial: [HistorialSchema]
  },
  { _id: false }
);

// Casa Schema
const CasaSchema = new Schema({
  nombre: { type: String, required: true, default: 'Casa' },
  nombreCasa: { type: String, required: true },
  direccion: DireccionSchema,
  central: CentralSchema,
  sensores: [DispositivoSchema],
  camaras: [DispositivoSchema]
});

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

/** Modelo de ``mongoose`` para acceder a la base de datos. */
export const UserModel = mongoose.model<User>('Usuario', UsuarioSchema);
