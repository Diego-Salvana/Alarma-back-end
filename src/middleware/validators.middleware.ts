import { NextFunction, Request, Response } from 'express';
import { ZodValidators } from '../utils';
import { SafeParseReturnType } from 'zod';

export function registerValidator (req: Request, res: Response, next: NextFunction) {
   validateRequest(req, res, next, ZodValidators.validateRegisterBody.bind(ZodValidators));
}

export function loginValidator (req: Request, res: Response, next: NextFunction) {
   validateRequest(req, res, next, ZodValidators.validateLoginBody.bind(ZodValidators));
}

export function updateUserValidator (req: Request, res: Response, next: NextFunction) {
   validateRequest(req, res, next, ZodValidators.validateUpdateUserBody.bind(ZodValidators));
}

export function createHouseValidator (req: Request, res: Response, next: NextFunction) {
   validateRequest(req, res, next, ZodValidators.validateCreateHouseBody.bind(ZodValidators));
}

export function updateHouseValidator (req: Request, res: Response, next: NextFunction) {
   validateRequest(req, res, next, ZodValidators.validateUpdateHouseBody.bind(ZodValidators));
}

// Función general
type KeyString = Record<string, string>;

function validateRequest (req: Request, res: Response, next: NextFunction, fn: Function) {
   try {
      const { body } = req;
      const result: SafeParseReturnType<KeyString, KeyString> = fn(body);

      if (!result.success) {
         res.status(400).send({ message: 'BadRequest', errors: result.error.errors });
         return;
      }

      next();
   } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'InternalServerError' });
   }
}
