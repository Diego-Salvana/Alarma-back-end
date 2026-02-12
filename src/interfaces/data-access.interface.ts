import { Register, UserSystemInfoDTO, UpdateUserDTO } from './dtos.interfaces';
import { House, User } from './domain.interfaces';

export interface IUserDataAccess {
  create(userBody: Register): Promise<void>;
  getOne(email: string): Promise<User>;
  getById(id: string): Promise<User>;
  getAll(): Promise<User[]>;
  updateInfo(id: string, updateBody: UpdateUserDTO): Promise<User>;
  updateSystemData(id: string, updateBody: UserSystemInfoDTO): Promise<User>;
  updatePassword(id: string, oldHash: string, newHash: string): Promise<void>;
  updateEmailVerification(username: string): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface RegisterDB extends Register {
  nombreUsuario: string;
  mosquittoPass: string;
  habilitado: boolean;
  casas: House[];
}
