/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Request, Response } from 'express';

import { UserService } from '../../src/services';
import { UserController } from '../../src/controllers';
import { LoginResponse, ProfileResponse, Purpose, RequestExt } from '../../src/interfaces';

describe('User Controller', () => {
  let userService: jest.Mocked<UserService>;
  let response: jest.Mocked<Response>;
  let userController: UserController;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as jest.Mocked<Response>;

    userService = {
      register: jest.fn(),
      login: jest.fn(),
      getById: jest.fn(),
      sendVerificationEmail: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      update: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    userController = new UserController(userService);
  });

  describe('create', () => {
    it('debería crear un usuario', async () => {
      const body = { email: 'test@example.com', password: 'password123' };
      userService.register.mockResolvedValue();

      await userController.create({ body } as Request, response);

      expect(userService.register).toHaveBeenCalledWith(body);
      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({ message: 'User created successfully', data: null });
    });

    it('debería propagar el error si falla el registro', async () => {
      const body = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Registration failed');
      userService.register.mockRejectedValue(error);

      await expect(userController.create({ body } as Request, response))
        .rejects
        .toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('debería iniciar sesión', async () => {
      const body = { email: 'test@example.com', password: 'password123' };
      userService.login.mockResolvedValue({} as LoginResponse);

      await userController.login({ body } as Request, response);

      expect(userService.login).toHaveBeenCalledWith(body.email, body.password);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'Login successful', data: {} });
    });

    it('debería propagar el error si las credenciales son inválidas', async () => {
      const body = { email: 'test@example.com', password: 'wrongpassword' };
      userService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(userController.login({ body } as Request, response))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('getById', () => {
    it('debería obtener un usuario por ID', async () => {
      const user = { sub: 'test-user-id' };
      userService.getById.mockResolvedValue({} as ProfileResponse);

      await userController.getById({ user } as RequestExt, response);

      expect(userService.getById).toHaveBeenCalledWith(user.sub);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'User retrieved successfully', data: {} });
    });

    it('debería propagar el error si el usuario no existe', async () => {
      const user = { sub: 'test-user-id' };
      userService.getById.mockRejectedValue(new Error('User not found'));

      await expect(userController.getById({ user } as RequestExt, response))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('sendVerificationEmail', () => {
    it('debería enviar el email de verificación', async () => {
      const body = { email: 'test@example.com' };
      userService.sendVerificationEmail.mockResolvedValue();

      await userController.sendVerificationEmail({ body } as Request, response);

      expect(userService.sendVerificationEmail).toHaveBeenCalledWith(body.email);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'Verification email sent', data: null });
    });

    it('debería propagar el error si falla el envío del email', async () => {
      const body = { email: 'test@example.com' };
      userService.sendVerificationEmail.mockRejectedValue(new Error('Email not sent'));

      await expect(userController.sendVerificationEmail({ body } as Request, response))
        .rejects
        .toThrow('Email not sent');
    });
  });

  describe('verifyEmail', () => {
    it('debería verificar el email y devolver el token de sesión', async () => {
      const verificationToken = {
        username: 'test_test@example.com',
        purpose: Purpose.EMAIL_VERIFICATION
      };
      userService.verifyEmail.mockResolvedValue('session-token');

      await userController.verifyEmail({ verificationToken } as RequestExt, response);

      expect(userService.verifyEmail).toHaveBeenCalledWith(verificationToken.username, verificationToken.purpose);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Verification successful',
        data: { token: 'session-token' }
      });
    });

    it('debería propagar el error si el tipo de token es inválido', async () => {
      const verificationToken = {
        username: 'test_test@example.com',
        purpose: Purpose.PASSWORD_RESET
      };
      userService.verifyEmail.mockRejectedValue(new Error('Invalid token type'));

      await expect(userController.verifyEmail({ verificationToken } as RequestExt, response))
        .rejects
        .toThrow('Invalid token type');
    });
  });

  describe('forgotPassword', () => {
    it('debería solicitar el restablecimiento de contraseña', async () => {
      const body = { email: 'test@example.com' };
      userService.forgotPassword.mockResolvedValue();

      await userController.forgotPassword({ body } as Request, response);

      expect(userService.forgotPassword).toHaveBeenCalledWith(body.email);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'Password reset email sent', data: null });
    });

    it('debería propagar el error si no se puede solicitar el restablecimiento', async () => {
      const body = { email: 'test@example.com' };
      userService.forgotPassword.mockRejectedValue(new Error('Action not available for demo user'));

      await expect(userController.forgotPassword({ body } as Request, response))
        .rejects
        .toThrow('Action not available for demo user');
    });
  });

  describe('resetPassword', () => {
    it('debería restablecer la contraseña y devolver el token de sesión', async () => {
      const body = { password: 'newPassword123' };
      const verificationToken = {
        username: 'test_test@example.com',
        purpose: Purpose.PASSWORD_RESET
      };
      userService.resetPassword.mockResolvedValue('session-token');

      await userController.resetPassword({ body, verificationToken } as RequestExt, response);

      expect(userService.resetPassword).toHaveBeenCalledWith(
        verificationToken.username,
        verificationToken.purpose,
        body.password
      );
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Password reset successful',
        data: { token: 'session-token' }
      });
    });

    it('debería propagar el error si el tipo de token es inválido', async () => {
      const body = { password: 'newPassword123' };
      const verificationToken = {
        username: 'test_test@example.com',
        purpose: Purpose.EMAIL_VERIFICATION
      };
      userService.resetPassword.mockRejectedValue(new Error('Invalid token type'));

      await expect(userController.resetPassword({ body, verificationToken } as RequestExt, response))
        .rejects
        .toThrow('Invalid token type');
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario', async () => {
      const user = { sub: 'test-user-id' };
      const body = { firstName: 'Nuevo', phone: '0987654321' };
      userService.update.mockResolvedValue({} as ProfileResponse);

      await userController.update({ body, user } as RequestExt, response);

      expect(userService.update).toHaveBeenCalledWith(user.sub, body);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'User updated successfully', data: {} });
    });

    it('debería propagar el error si la contraseña actual es incorrecta', async () => {
      const user = { sub: 'test-user-id' };
      const body = { currentPassword: 'wrongpassword', newPassword: 'newPassword123' };
      userService.update.mockRejectedValue(new Error('Current password is incorrect'));

      await expect(userController.update({ body, user } as RequestExt, response))
        .rejects
        .toThrow('Current password is incorrect');
    });
  });
});
