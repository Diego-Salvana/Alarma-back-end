import { armConfigurationSchema, centralCodeSchema, centralSystemInfoSchema, createSensorSchema, houseSystemInfoSchema, loginSchema, registerSchema, sensorNameSchema, sensorSystemInfoSchema, updateUserSchema, userSystemInfoSchema } from '../utils/zod-validators';
import { z } from 'zod';

// -------------------
/* User */
// -------------------
export type LoginDTO = z.infer<typeof loginSchema>;

export type RegisterDTO = z.infer<typeof registerSchema>;

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export type UserSystemInfoDTO = z.infer<typeof userSystemInfoSchema>;

// -------------------
/* Houses */
// -------------------
export type HouseSystemInfoDTO = z.infer<typeof houseSystemInfoSchema>;

export type ArmConfigurationDTO = z.infer<typeof armConfigurationSchema>;

// -------------------
/* Central */
// -------------------
export type CentralCodeDTO = z.infer<typeof centralCodeSchema>;

export type CentralSystemInfoDTO = z.infer<typeof centralSystemInfoSchema>;

// -------------------
/* Sensors */
// -------------------
export type SensorNameDTO = z.infer<typeof sensorNameSchema>;

export type SensorSystemInfoDTO = z.infer<typeof sensorSystemInfoSchema>;

export type CreateSensorDTO = z.infer<typeof createSensorSchema>;
