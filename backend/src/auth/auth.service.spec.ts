import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw UnauthorizedException if user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'nonexistent@enmlegal.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should authenticate user and return token when credentials match', async () => {
    const hashedPassword = await bcrypt.hash('validPassword123', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      name: 'Advocate Eva',
      email: 'eva@enmlegal.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      imageUrl: null,
    });

    const res = await service.login({
      email: 'eva@enmlegal.com',
      password: 'validPassword123',
    });

    expect(res).toBeDefined();
    expect(res.token).toEqual('mock-jwt-token');
    expect(res.accessToken).toEqual('mock-jwt-token');
    expect(res.user.email).toEqual('eva@enmlegal.com');
  });
});
