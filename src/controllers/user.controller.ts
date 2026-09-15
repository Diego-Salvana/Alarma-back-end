import { Request, Response } from 'express';

import { UserService } from '../services';
import { RequestExt, SessionJwtPayload, VerificationJwtPayload } from '../interfaces';
import { ValidationError } from '../errors';
import { sendSuccess } from '../utils';

export class UserController {
  constructor (private userService: UserService) {}

  async create ({ body }: Request, res: Response) {
    await this.userService.create(body);

    sendSuccess(res, 201, 'User created successfully', null);
  }

  async login ({ body }: Request, res: Response) {
    const { email, password } = body;

    if (!email || !password) throw new ValidationError('Missing login credentials');

    const responseUser = await this.userService.login(email, password);

    sendSuccess(res, 200, 'Login successful', responseUser);
  }

  async sendVerificationEmail ({ body }: Request, res: Response) {
    const { email } = body;

    if (!email) throw new ValidationError('Email is required');

    await this.userService.sendVerificationEmail(email);

    sendSuccess(res, 200, 'Verification email sent', null);
  }

  async verifyEmail ({ verificationToken }: RequestExt, res: Response) {
    const { username, purpose } = verificationToken as VerificationJwtPayload;
    const sessionToken = await this.userService.verifyEmail(username, purpose);

    sendSuccess(res, 200, 'Verification successful', { token: sessionToken });
  }

  async forgotPassword ({ body }: Request, res: Response) {
    const { email } = body;

    if (!email) throw new ValidationError('Email is required');

    await this.userService.forgotPassword(email);

    sendSuccess(res, 200, 'Password reset email sent', null);
  }

  async resetPassword ({ body, verificationToken }: RequestExt, res: Response) {
    const { username, purpose } = verificationToken as VerificationJwtPayload;
    const { password } = body;

    if (!password) throw new ValidationError('New password is required');

    const sessionToken = await this.userService.resetPassword(username, purpose, password);

    sendSuccess(res, 200, 'Password reset successful', { token: sessionToken });
  }

  async getById ({ user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;
    const responseUser = await this.userService.getById(sub);

    sendSuccess(res, 200, 'User retrieved successfully', responseUser);
  }

  async update ({ body, user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;
    const responseUser = await this.userService.update(sub, body);

    sendSuccess(res, 200, 'User updated successfully', responseUser);
  }
}
