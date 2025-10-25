import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    shop: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        RAZORPAY_KEY_ID: 'test-key-id',
        RAZORPAY_KEY_SECRET: 'test-key-secret',
        RAZORPAY_WEBHOOK_SECRET: 'test-webhook-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMembershipCheckout', () => {
    it('should create membership checkout successfully', async () => {
      const shopId = 'shop-123';
      const plan = 'monthly';
      const amountInPaise = 99900;

      mockPrismaService.shop.findUnique.mockResolvedValue({
        id: shopId,
        name: 'Test Shop',
      });

      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'txn-123',
        shopId,
        amountInPaise,
        currency: 'INR',
        status: 'PENDING',
      });

      const result = await service.createMembershipCheckout(shopId, plan, amountInPaise);

      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('keyId');
      expect(result).toHaveProperty('transactionId');
      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if shop not found', async () => {
      const shopId = 'invalid-shop';
      const plan = 'monthly';
      const amountInPaise = 99900;

      mockPrismaService.shop.findUnique.mockResolvedValue(null);

      await expect(
        service.createMembershipCheckout(shopId, plan, amountInPaise),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException with invalid signature', async () => {
      const signature = 'invalid-signature';
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_123',
              order_id: 'order_123',
            },
          },
        },
      };

      await expect(service.handleWebhook(signature, payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
