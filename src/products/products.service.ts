import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, dto: CreateProductDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        shopId,
        tags: dto.tags || [],
      },
      include: {
        shop: {
          include: {
            city: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
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
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shop.ownerId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
      include: {
        shop: true,
      },
    });
  }

  async findByCitySlug(
    citySlug: string,
    filters: {
      q?: string;
      category?: ProductCategory;
      fromPrice?: number;
      toPrice?: number;
      purity?: string;
      page?: number;
      perPage?: number;
    },
  ) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: any = {
      active: true,
      shop: {
        cityId: city.id,
        verified: true,
      },
    };

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { tags: { has: filters.q } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.fromPrice || filters.toPrice) {
      where.priceInPaise = {};
      if (filters.fromPrice) {
        where.priceInPaise.gte = filters.fromPrice;
      }
      if (filters.toPrice) {
        where.priceInPaise.lte = filters.toPrice;
      }
    }

    if (filters.purity) {
      where.purity = filters.purity;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          shop: {
            include: {
              city: true,
            },
          },
        },
        skip,
        take: perPage,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async search(filters: {
    q?: string;
    city?: string;
    category?: ProductCategory;
    page?: number;
    perPage?: number;
  }) {
    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: any = {
      active: true,
      shop: {
        verified: true,
      },
    };

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { tags: { has: filters.q } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.city) {
      const city = await this.prisma.city.findUnique({
        where: { slug: filters.city },
      });
      if (city) {
        where.shop.cityId = city.id;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          shop: {
            include: {
              city: true,
            },
          },
        },
        skip,
        take: perPage,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findFeatured(limit: number = 20) {
    return this.prisma.product.findMany({
      where: {
        featured: true,
        active: true,
        shop: {
          verified: true,
        },
      },
      include: {
        shop: {
          include: {
            city: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
