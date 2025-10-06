import { hash, compare } from 'bcryptjs';

export async function encrypt (password: string): Promise<string> {
   return await hash(password, Number(process.env.SALT));
}

/** Verifica si el ``string`` coincide con la contraseña encriptada. */
export async function verify (password: string, passwordHash: string): Promise<boolean> {
   return await compare(password, passwordHash);
}
