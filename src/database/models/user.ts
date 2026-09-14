import { UserModel } from '.';
import { IUserDataAccess, User } from '../../interfaces';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../errors';

export class UserDataAccess implements IUserDataAccess {
  private userModel = UserModel;
  private withoutHistory =
    '-casas.sensores.historial -casas.camaras.historial -casas.central.historial';

  /** Crea un nuevo usuario en la base de datos. */
  async create (userBody: Partial<User>): Promise<void> {
    try {
      await this.userModel.create(userBody);
    } catch (err: any) {
      if (err.code === 11000) throw new ConflictError('User with this data already exists');
      throw err;
    }
  }

  /** Obtiene un usuario por su email. */
  async getOne (email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFoundError('User not found');

    return user;
  }

  /** Obtiene un usuario por su id. */
  async getById (id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFoundError('User not found');

    return user;
  }

  /** Obtiene todos los usuarios. */
  async getAll (): Promise<User[]> {
    return await this.userModel.find().select(this.withoutHistory).lean();
  }

  /** Actualiza un usuario por su id. */
  async updateInfo (id: string, updateBody: Partial<User>): Promise<User> {
    const newInfo = {
      ...(updateBody.nombre && { nombre: updateBody.nombre }),
      ...(updateBody.apellido && { apellido: updateBody.apellido }),
      ...(updateBody.email && { email: updateBody.email }),
      ...(updateBody.telefono && { telefono: updateBody.telefono })
    };

    let updatedUser: User | null = null;

    try {
      updatedUser = await this.userModel
        .findByIdAndUpdate(id, newInfo, { new: true })
        .select(this.withoutHistory)
        .lean();
    } catch (err: any) {
      if (err.code === 11000) throw new ConflictError('Email already in use');
      throw err;
    }

    if (updatedUser === null) throw new NotFoundError('User not found');

    return updatedUser;
  }

  /** Actualiza información de sistema para el usuario. */
  async updateSystemData (id: string, updateBody: Partial<User>): Promise<User> {
    const newInfo = {
      ...(updateBody.nombreUsuario && { nombreUsuario: updateBody.nombreUsuario }),
      ...(updateBody.mosquittoPass && { mosquittoPass: updateBody.mosquittoPass }),
      ...(updateBody.habilitado !== undefined && { habilitado: updateBody.habilitado })
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, newInfo, { new: true })
      .select(this.withoutHistory)
      .lean();

    if (updatedUser === null) throw new NotFoundError('User not found');

    return updatedUser;
  }

  /** Actualiza la contraseña de un usuario por su id. */
  async updatePassword (id: string, oldHash: string, newHash: string): Promise<void> {
    const result = await this.userModel.updateOne(
      {
        _id: id,
        contrasena: oldHash
      },
      {
        $set: { contrasena: newHash }
      }
    );

    if (result.modifiedCount === 0) {
      throw new UnauthorizedError('Password or user does not match');
    }
  }

  /** Actualiza la verificación de un usuario por su nombre de usuario. */
  async updateEmailVerification (username: string): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      {
        nombreUsuario: username
      },
      {
        $set: { habilitado: true }
      },
      {
        new: true
      }
    );

    if (!user) {
      throw new UnauthorizedError('User does not match for email verification');
    }

    return user;
  }

  /** Elimina un usuario por su id. */
  async delete (id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (deletedUser === null) throw new NotFoundError('User not found');
  }
}
