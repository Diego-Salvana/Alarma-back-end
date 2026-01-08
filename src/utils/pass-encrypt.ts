import { hash, compare } from 'bcryptjs';

/** Genera hash de contraseña usando bcryptjs. */
export async function encrypt (password: string): Promise<string> {
  return await hash(password, Number(process.env.SALT));
}

/** Verifica si el ``string`` proporcionado coincide con la contraseña encriptada. */
export async function verifyPass (password: string, passwordHash: string): Promise<boolean> {
  return await compare(password, passwordHash);
}
