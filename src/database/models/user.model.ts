import mongoose, { HydratedDocument, Schema, Types } from 'mongoose';

export interface UserPersistence {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  enabled: boolean;
}

export type UserDoc = HydratedDocument<UserPersistence>;

export type LeanUser = UserPersistence & { _id: Types.ObjectId };

const UserSchema = new Schema<UserPersistence>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: false }
  },
  { timestamps: true, versionKey: '__v' }
);

export const UserModel = mongoose.model<UserPersistence>('User', UserSchema);
