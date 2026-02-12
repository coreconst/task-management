import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
    jwtService = moduleRef.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns token', async () => {
    userService.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    userService.create.mockResolvedValue({
      _id: 'user-id',
      email: 'user@example.com',
      name: 'User',
    } as any);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await authService.register({
      email: 'user@example.com',
      password: 'password',
      name: 'User',
    });

    expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(userService.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      name: 'User',
      password: 'hashed',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'user@example.com',
    });
    expect(result).toEqual({
      id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      accessToken: 'token',
    });
  });

  it('throws ConflictException when user already exists on register', async () => {
    userService.findByEmail.mockResolvedValue({ _id: 'exists' } as any);

    await expect(
      authService.register({
        email: 'user@example.com',
        password: 'password',
        name: 'User',
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in and returns token', async () => {
    userService.findByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await authService.login({
      email: 'user@example.com',
      password: 'password',
    });

    expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'user@example.com',
    });
    expect(result.accessToken).toBe('token');
  });

  it('throws UnauthorizedException when user not found', async () => {
    userService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'user@example.com',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password invalid', async () => {
    userService.findByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'user@example.com',
        password: 'password',
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
