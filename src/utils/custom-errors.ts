export class CustomError extends Error {
   statusCode: number = 0;
}

export class AlreadyExists extends CustomError {
   constructor (message: string) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = 409;
   }
}

export class NotFound extends CustomError {
   constructor (message: string) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = 404;
   }
}

export class BadRequest extends CustomError {
   constructor (message: string) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = 400;
   }
}
