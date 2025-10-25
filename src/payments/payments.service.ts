import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { MembershipStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createMembershipCheckout(shopId: string, plan: string, amountInPaise: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new BadRequestException('Shop not found');
    }

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `shop_${shopId}_${Date.now()}`,
      notes: {
        shopId,
        plan,
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        shopId,
        amountInPaise,
        currency: 'INR',
        provider: 'razorpay',
        providerOrderId: order.id,
        status: TransactionStatus.PENDING,
        metadata: {
          plan,
        },
      },
    });

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: this.configService.get('RAZORPAY_KEY_ID'),
      transactionId: transaction.id,
    };
  }

  async handleWebhook(signature: string, payload: any) {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid signature');
    }

    const event = payload.event;
    const paymentEntity = payload.payload.payment.entity;

    if (event === 'payment.captured') {
      await this.handlePaymentCaptured(paymentEntity);
    }

    return { status: 'ok' };
  }

  private async handlePaymentCaptured(paymentEntity: any) {
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        providerPaymentId: paymentId,
      },
    });

    if (existingTransaction) {
      return;
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        providerOrderId: orderId,
      },
    });

    if (!transaction) {
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.SUCCESS,
        providerPaymentId: paymentId,
        payload: paymentEntity,
      },
    });

    if (transaction.shopId && transaction.metadata) {
      const plan = (transaction.metadata as any).plan;
      const startedAt = new Date();
      const expiresAt = new Date();
      
      if (plan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (plan === 'quarterly') {
        expiresAt.setMonth(expiresAt.getMonth() + 3);
      } else if (plan === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      await this.prisma.membership.create({
        data: {
          shopId: transaction.shopId,
          plan,
          amountInPaise: transaction.amountInPaise,
          currency: transaction.currency,
          startedAt,
          expiresAt,
          status: MembershipStatus.ACTIVE,
          transactionRef: transaction.id,
        },
      });

      await this.prisma.shop.update({
        where: { id: transaction.shopId },
        data: {
          membershipStatus: MembershipStatus.ACTIVE,
          membershipStartedAt: startedAt,
          membershipExpiresAt: expiresAt,
        },
      });
    }
  }
}
