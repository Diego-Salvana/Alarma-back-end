import { hash, compare } from 'bcryptjs';

/** Genera un hash de contraseña utilizando bcryptj. */
export async function encrypt (password: string): Promise<string> {
  return await hash(password, Number(process.env.SALT));
}

/** Verifica si la cadena proporcionada coincide con la contraseña cifrada. */
export async function verifyPass (password: string, passwordHash: string): Promise<boolean> {
  return await compare(password, passwordHash);
}
