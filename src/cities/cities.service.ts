import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.city.findMany({
      include: {
        state: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.city.findUnique({
      where: { slug },
      include: {
        state: true,
      },
    });
  }

  async findShopsByCity(slug: string, verified?: boolean) {
    const city = await this.prisma.city.findUnique({
      where: { slug },
    });

    if (!city) {
      return null;
    }

    return this.prisma.shop.findMany({
      where: {
        cityId: city.id,
        ...(verified !== undefined ? { verified } : {}),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        city: true,
      },
    });
  }
}
