import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async verifyShop(adminId: string, shopId: string, verified: boolean) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: { verified },
    });
  }

  async getAllShops(adminId: string, verified?: boolean) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.prisma.shop.findMany({
      where: verified !== undefined ? { verified } : {},
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        city: true,
        _count: {
          select: {
            products: true,
            leads: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllTransactions(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllLeads(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.prisma.lead.findMany({
      include: {
        product: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStats(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    const [
      totalShops,
      verifiedShops,
      totalProducts,
      totalLeads,
      totalTransactions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.shop.count(),
      this.prisma.shop.count({ where: { verified: true } }),
      this.prisma.product.count(),
      this.prisma.lead.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amountInPaise: true },
      }),
    ]);

    return {
      totalShops,
      verifiedShops,
      totalProducts,
      totalLeads,
      totalTransactions,
      totalRevenue: totalRevenue._sum.amountInPaise || 0,
    };
  }
}
