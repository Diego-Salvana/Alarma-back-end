import { Login, Register } from './auth.interface';
import { IUserDocument, User } from './user.interface';

export interface IUserDataAccess {
   create(userBody: Register): Promise<IUserDocument>;
   getOne(loginBody: Login): Promise<User | null>;
   update(id: string, updateBody: Register): Promise<User | null>;
   delete(id: string): Promise<User | null>;
}
