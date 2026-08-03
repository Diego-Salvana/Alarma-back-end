const demoUserId = process.env.DEMO_USER_ID;

if (!demoUserId) {
  throw new Error('La variable de entorno DEMO_USER_ID es requerida');
}

export function isDemoUser (userId: string): boolean {
  return userId === demoUserId;
}
