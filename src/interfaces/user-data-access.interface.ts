import { Register } from './auth.interface';
import { IUserDocument, User } from './user.interface';

export interface IUserDataAccess {
  create(userBody: Register): Promise<IUserDocument>;
  getOne(email: string): Promise<User>;
  getById(id: string): Promise<User>;
  updateInfo(id: string, updateBody: Register): Promise<User>;
  updatePassword(id: string, oldHash: string, newHash: string): Promise<void>;
  updateEmailVerification(username: string): Promise<User>;
  delete(id: string): Promise<void>;
}
