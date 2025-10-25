import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto, UpdateShopDto } from './dto/create-shop.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateShopDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.SHOP_OWNER },
    });

    return this.prisma.shop.create({
      data: {
        ...dto,
        ownerId: userId,
      },
      include: {
        city: true,
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        city: {
          include: {
            state: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        products: {
          where: { active: true },
          take: 10,
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async update(userId: string, shopId: string, dto: UpdateShopDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You do not own this shop');
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: dto,
      include: {
        city: true,
      },
    });
  }

  async findMyShops(userId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId: userId },
      include: {
        city: true,
        _count: {
          select: {
            products: true,
            leads: true,
          },
        },
      },
    });
  }
}
