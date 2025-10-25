import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, dto: CreateLeadDto, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.lead.create({
      data: {
        ...dto,
        productId,
        shopId: product.shopId,
        userId,
      },
      include: {
        product: true,
        shop: {
          include: {
            city: true,
          },
        },
      },
    });
  }

  async findByShop(shopId: string) {
    return this.prisma.lead.findMany({
      where: { shopId },
      include: {
        product: true,
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
}
