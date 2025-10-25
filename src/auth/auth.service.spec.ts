import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    otpCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        role: 'CUSTOMER',
      });
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: loginDto.email,
        phone: '+919876543210',
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
      });
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const sendOtpDto = {
        phone: '+919876543210',
      };

      mockPrismaService.otpCode.create.mockResolvedValue({});

      const result = await service.sendOtp(sendOtpDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('expiresIn');
      expect(mockPrismaService.otpCode.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no email or phone provided', async () => {
      const sendOtpDto = {};

      await expect(service.sendOtp(sendOtpDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and create new user if not exists', async () => {
      const verifyOtpDto = {
        phone: '+919876543210',
        code: '123456',
      };

      mockPrismaService.otpCode.findFirst.mockResolvedValue({
        id: '1',
        phone: verifyOtpDto.phone,
        code: verifyOtpDto.code,
        verified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrismaService.otpCode.update.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        name: verifyOtpDto.phone,
        phone: verifyOtpDto.phone,
        role: 'CUSTOMER',
      });
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.verifyOtp(verifyOtpDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException with invalid OTP', async () => {
      const verifyOtpDto = {
        phone: '+919876543210',
        code: '999999',
      };

      mockPrismaService.otpCode.findFirst.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
