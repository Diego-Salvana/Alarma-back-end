const demoUserId = process.env.DEMO_USER_ID;

if (!demoUserId) {
  throw new Error('The environment variable DEMO_USER_ID is required');
}

export function isDemoUser (userId: string): boolean {
  return userId === demoUserId;
}
