/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { House, LoginResponse, ProfileResponse, Purpose, Register, State, User, type EmailSender, type IUserDataAccess } from '../../src/interfaces';
import { HouseDataAccess } from '../../src/database/access/mongodb/house';
import { UserService } from '../../src/services';
import { encrypt, verifyPass } from '../../src/utils';

describe('User Service', () => {
  let userDataAccess: jest.Mocked<IUserDataAccess>;
  let houseDataAccess: jest.Mocked<HouseDataAccess>;
  let emailService: jest.Mocked<EmailSender>;
  let userService: UserService;
  const email = 'test@example.com';
  const password = 'password123';
  const userMock: User = {
    _id: '1234567890',
    firstName: 'Test User',
    lastName: 'Test User',
    username: 'test-user',
    email,
    enabled: true,
    phone: '1234567890',
    password
  };

  const housesMock: House[] = [
    {
      _id: '12345',
      userId: '1234567890',
      name: 'House 1',
      houseName: 'House 1',
      address: {
        street: 'Street 1',
        number: '1',
        city: 'City 1',
        country: 'Country 1'
      },
      controlPanel: {
        model: 'Model 1',
        alarmCode: '1234',
        alarmState: State.ON,
        ringing: false
      },
      sensors: [],
      cameras: []
    }
  ];

  const profileResponseMock: ProfileResponse = {
    _id: '1234567890',
    firstName: 'Test User',
    lastName: 'Test User',
    username: 'test-user',
    email: 'test@example.com',
    phone: '1234567890',
    enabled: true,
    houses: [
      {
        _id: '12345',
        name: 'House 1',
        houseName: 'House 1',
        address: {
          street: 'Street 1',
          number: '1',
          city: 'City 1',
          country: 'Country 1'
        },
        alarmState: State.ON,
        ringing: false
      }
    ]
  };

  beforeEach(() => {
    userDataAccess = {
      create: jest.fn(),
      getOne: jest.fn(),
      getById: jest.fn(),
      updateInfo: jest.fn(),
      updatePassword: jest.fn(),
      emailVerification: jest.fn()
    } as unknown as jest.Mocked<IUserDataAccess>;
    houseDataAccess = {
      getAllByUserId: jest.fn()
    } as unknown as jest.Mocked<HouseDataAccess>;
    emailService = {
      sendVerificationEmail: jest.fn()
    } as unknown as jest.Mocked<EmailSender>;

    userService = new UserService(userDataAccess, emailService, houseDataAccess);
  });
  
  it('debería obtener un usuario por su id', async () => {
    const id = '1234567890';
    userDataAccess.getById.mockResolvedValue(userMock);
    houseDataAccess.getAllByUserId.mockResolvedValue(housesMock);

    const response = await userService.getById(id);

    expect(response).toEqual(profileResponseMock);
    expect(userDataAccess.getById).toHaveBeenCalledWith(id);
    expect(userDataAccess.getById).toHaveBeenCalledTimes(1);
    expect(houseDataAccess.getAllByUserId).toHaveBeenCalledWith(id);
    expect(userMock._id).toBe(id);
  });

  it('debería propagar la excepción cuando no se encuentra el usuario', async () => {
    const id = '1234567890';
    userDataAccess.getById.mockRejectedValue(new Error('User not found'));

    await expect(userService.getById(id)).rejects.toThrow('User not found');
  });

  it('debería crear un usuario', async () => {
    const userInfo: Register = {
      firstName: 'Test User',
      lastName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    };
    userDataAccess.create.mockResolvedValue();
    emailService.sendVerificationEmail.mockResolvedValue();

    const response = await userService.register(userInfo);

    expect(response).toBeUndefined();
    expect(userDataAccess.create).toHaveBeenCalledTimes(1);
    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('debería propagar la excepción cuando no se puede crear el usuario', async () => {
    const userInfo: Register = {
      firstName: 'Test User',
      lastName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    };

    userDataAccess.create.mockRejectedValue(new Error('User not created'));
   
    await expect(userService.register(userInfo)).rejects.toThrow('User not created');
  });

  it('debería iniciar sesión', async () => {
    const hashedPassword = await encrypt(password);
    const userWithHashedPasswordMock: User = { ...userMock, password: hashedPassword };

    const loginResponseMock: LoginResponse = {
      firstName: 'Test User',
      email,
      enabled: true,
      token: expect.any(String),
      houses: []
    };
    userDataAccess.getOne.mockResolvedValue(userWithHashedPasswordMock);
    houseDataAccess.getAllByUserId.mockResolvedValue([]);

    const response = await userService.login(email, password);

    expect(response).toEqual(loginResponseMock);
    expect(userDataAccess.getOne).toHaveBeenCalledWith(email);
    expect(userDataAccess.getOne).toHaveBeenCalledTimes(1);
    expect(houseDataAccess.getAllByUserId).toHaveBeenCalledWith(userMock._id);
  });

  it('debería lanzar "Invalid credentials" cuando las credenciales son inválidas', async () => {
    const hashedPassword = await encrypt(password);
    const userWithHashedPasswordMock: User = { ...userMock, password: hashedPassword };
    userDataAccess.getOne.mockResolvedValue(userWithHashedPasswordMock);
    houseDataAccess.getAllByUserId.mockResolvedValue([]);

    await expect(userService.login(email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  it(
    'debería lanzar "Current password is incorrect" cuando la contraseña actual es incorrecta',
    async () => {
      const hashedPassword = await encrypt(password);
      const userWithHashedPasswordMock: User = { ...userMock, password: hashedPassword };
      userDataAccess.getById.mockResolvedValue(userWithHashedPasswordMock);

      await expect(userService.update(userMock._id, {
        currentPassword: 'wrongpassword',
        newPassword: 'newPassword123'
      })).rejects.toThrow('Current password is incorrect');

      expect(userDataAccess.updatePassword).not.toHaveBeenCalled();
      expect(userDataAccess.updateInfo).not.toHaveBeenCalled();
    }
  );

  it('debería actualizar solo la contraseña cuando no se envían datos', async () => {
    const hashedPassword = await encrypt(password);
    const userWithHashedPasswordMock: User = { ...userMock, password: hashedPassword };
    userDataAccess.getById.mockResolvedValue(userWithHashedPasswordMock);
    houseDataAccess.getAllByUserId.mockResolvedValue(housesMock);
    userDataAccess.updatePassword.mockResolvedValue();

    const response = await userService.update(userMock._id, {
      currentPassword: password,
      newPassword: 'newPassword123'
    });

    expect(userDataAccess.updatePassword).toHaveBeenCalledTimes(1);
    const [id, oldHash, newHash] = userDataAccess.updatePassword.mock.calls[0];
    expect(id).toBe(userMock._id);
    expect(oldHash).toBe(hashedPassword);
    expect(await verifyPass('newPassword123', newHash)).toBe(true);

    expect(userDataAccess.updateInfo).not.toHaveBeenCalled();
    expect(response).toEqual(profileResponseMock);
  });

  it('debería actualizar solo los datos cuando no se envían contraseñas', async () => {
    const updatedUserMock: User = { ...userMock, firstName: 'Nuevo', phone: '0987654321' };
    userDataAccess.getById.mockResolvedValue(userMock);
    houseDataAccess.getAllByUserId.mockResolvedValue(housesMock);
    userDataAccess.updateInfo.mockResolvedValue(updatedUserMock);

    const response = await userService.update(userMock._id, {
      firstName: 'Nuevo',
      phone: '0987654321'
    });

    expect(userDataAccess.updateInfo).toHaveBeenCalledWith(userMock._id, {
      firstName: 'Nuevo',
      phone: '0987654321'
    });
    expect(userDataAccess.updatePassword).not.toHaveBeenCalled();

    const expectedResponse: ProfileResponse = {
      ...profileResponseMock,
      firstName: 'Nuevo',
      phone: '0987654321'
    };
    expect(response).toEqual(expectedResponse);
  });

  it('debería lanzar "Invalid token type" cuando el propósito de verifyEmail es inválido', async () => {
    await expect(userService.verifyEmail('prefix-test@example.com', Purpose.PASSWORD_RESET))
      .rejects.toThrow('Invalid token type');

    expect(userDataAccess.getOne).not.toHaveBeenCalled();
    expect(userDataAccess.emailVerification).not.toHaveBeenCalled();
  });

  it('debería lanzar "Invalid token type" cuando el propósito de resetPassword es inválido', async () => {
    await expect(userService.resetPassword(
      'prefix-test@example.com',
      Purpose.EMAIL_VERIFICATION,
      'newPassword123'
    )).rejects.toThrow('Invalid token type');

    expect(userDataAccess.getOne).not.toHaveBeenCalled();
    expect(userDataAccess.updatePassword).not.toHaveBeenCalled();
  });
});
