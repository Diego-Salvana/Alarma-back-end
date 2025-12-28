import { UserModel } from '.';
import { IUserDataAccess, IUserDocument, Register, User } from '../interfaces';
import { AlreadyExists } from '../utils';

/** Provee acceso a la base de datos para operaciones con Usuarios. */
export class UserDataAccess implements IUserDataAccess {
  private userModel = UserModel;

  /** Crea un nuevo usuario en la base de datos. */
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

  /** Obtiene un usuario por su email. */
  async getOne (email: string): Promise<User | null> {
    const user: User | null = await this.userModel
      .findOne({ email })
      .select(
        '-casas.sensores.historial -casas.camaras.historial -casas.central.historial'
      )
      .lean();

    return user;
  }

  /** Obtiene un usuario por su id. */
  async getById (id: string): Promise<User | null> {
    const user: User | null = await this.userModel
      .findById(id)
      .select(
        '-casas.sensores.historial -casas.camaras.historial -casas.central.historial'
      )
      .lean();

    return user;
  }

  /** Actualiza un usuario por su id. */
  async update (id: string, updateBody: Register): Promise<User | null> {
    let updatedUser: User | null;

    try {
      updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateBody, { new: true })
        .select(
          '-casas.sensores.historial -casas.camaras.historial -casas.central.historial'
        )
        .lean();
    } catch (err: any) {
      console.log('Data Access: ', err);
      if (err.code === 11000) {
        throw new AlreadyExists(`El email ${updateBody.email} ya está en uso`);
      }
      throw err;
    }

    return updatedUser;
  }

  /** Elimina un usuario por su id. */
  async delete (id: string): Promise<User | null> {
    const user: User | null = await this.userModel.findByIdAndDelete(id);

    return user;
  }
}
