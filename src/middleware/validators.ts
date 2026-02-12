import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateBody (validator: z.AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validator.safeParse(req.body);

      if (!result.success) {
        res.status(400).send({ message: 'BadRequest', errors: result.error.errors });
        return;
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'InternalServerError' });
    }
  };
}
