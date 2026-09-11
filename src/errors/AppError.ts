export abstract class AppError extends Error {
  constructor (
    public readonly statusCode: number,
    message: string,
    public readonly name: string
  ) {
    super(message);
  }
}
