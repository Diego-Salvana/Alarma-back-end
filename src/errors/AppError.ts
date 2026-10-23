export abstract class AppError extends Error {
  constructor (
    public statusCode: number,
    message: string,
    public name: string
  ) {
    super(message);
  }
}
