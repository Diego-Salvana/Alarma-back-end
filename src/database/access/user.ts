import { LeanUser, UserModel } from '../models/user.model';
import { IUserDataAccess, User } from '../../interfaces';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../errors';

export class UserDataAccess implements IUserDataAccess {
  private userModel = UserModel;

  async create (userBody: Partial<User>): Promise<void> {
    try {
      await this.userModel.create(userBody);
    } catch (err: any) {
      if (err.code === 11000) throw new ConflictError('User with this data already exists');
      throw err;
    }
  }

  async getOne (email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .lean<LeanUser>();

    if (user === null) throw new NotFoundError('User not found');

    return this.toDomain(user);
  }

  /** Obtiene un usuario por su id (incluye password para verificación). */
  async getById (id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('+password')
      .lean<LeanUser>();

    if (user === null) throw new NotFoundError('User not found');

    return this.toDomain(user);
  }

  async getAll (): Promise<User[]> {
    const users = await this.userModel.find().lean<LeanUser[]>();

    return users.map(user => this.toDomain(user));
  }

  async updateInfo (id: string, updateBody: Partial<User>): Promise<User> {
    const newInfo = {
      ...(updateBody.firstName && { firstName: updateBody.firstName }),
      ...(updateBody.lastName && { lastName: updateBody.lastName }),
      ...(updateBody.email && { email: updateBody.email }),
      ...(updateBody.phone && { phone: updateBody.phone })
    };

    let updatedUser: LeanUser | null = null;

    try {
      updatedUser = await this.userModel
        .findByIdAndUpdate(id, newInfo, { new: true })
        .lean<LeanUser>();
    } catch (err: any) {
      if (err.code === 11000) throw new ConflictError('Email already in use');
      throw err;
    }

    if (updatedUser === null) throw new NotFoundError('User not found');

    return this.toDomain(updatedUser);
  }

  /** Actualiza información de sistema para el usuario por un Administrador. */
  async updateSystemData (id: string, updateBody: Partial<User>): Promise<User> {
    const newInfo = {
      ...(updateBody.username && { username: updateBody.username }),
      ...(updateBody.enabled !== undefined && { enabled: updateBody.enabled })
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, newInfo, { new: true })
      .lean<LeanUser>();

    if (updatedUser === null) throw new NotFoundError('User not found');

    return this.toDomain(updatedUser);
  }

  async updatePassword (id: string, oldHash: string, newHash: string): Promise<void> {
    const result = await this.userModel.updateOne(
      {
        _id: id,
        password: oldHash
      },
      {
        $set: { password: newHash }
      }
    );

    if (result.modifiedCount === 0) {
      throw new UnauthorizedError('Password or user does not match');
    }
  }

  async emailVerification (username: string): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      {
        username
      },
      {
        $set: { enabled: true }
      },
      {
        new: true
      }
    ).lean<LeanUser>();

    if (user === null) {
      throw new UnauthorizedError('User does not match for email verification');
    }

    return this.toDomain(user);
  }

  async delete (id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (deletedUser === null) throw new NotFoundError('User not found');
  }

  private toDomain (doc: LeanUser): User {
    return {
      _id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      enabled: doc.enabled
    };
  }
}
