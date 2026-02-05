import { UserModel } from '.';
import { IUserDataAccess, IUserDocument, Register, User } from '../interfaces';
import { AlreadyExists, NotFound, Unauthorized } from '../utils';

/** Provee acceso a la base de datos para operaciones con Usuarios. */
export class UserDataAccess implements IUserDataAccess {
  private userModel = UserModel;
  private withoutHistory =
    '-casas.sensores.historial -casas.camaras.historial -casas.central.historial';

  /** Crea un nuevo usuario en la base de datos. */
  async create (userBody: Register): Promise<IUserDocument> {
    try {
      return await this.userModel.create(userBody);
    } catch (err: any) {
      if (err.code === 11000) throw new AlreadyExists('Ya existe un usuario con esos datos');
      throw err;
    }
  }

  /** Obtiene un usuario por su email. */
  async getOne (email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Usuario no encontrado');

    return user;
  }

  /** Obtiene un usuario por su id. */
  async getById (id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select(this.withoutHistory)
      .lean();

    if (user === null) throw new NotFound('Usuario no encontrado');

    return user;
  }

  /** Actualiza un usuario por su id. */
  async updateInfo (id: string, updateBody: Register): Promise<User> {
    let updatedUser: User | null;

    try {
      updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateBody, { new: true })
        .select(this.withoutHistory)
        .lean();
    } catch (err: any) {
      if (err.code === 11000) throw new AlreadyExists(`El email ${updateBody.email} ya está en uso`);
      throw err;
    }

    if (updatedUser === null) throw new NotFound('Usuario no encontrado');

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
      throw new Unauthorized('La contraseña o el usuario no coinciden');
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
      throw new Unauthorized('El usuario no coincide para verificar el email');
    }

    return user;
  }

  /** Elimina un usuario por su id. */
  async delete (id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (deletedUser === null) throw new NotFound('Usuario no encontrado');
  }
}
