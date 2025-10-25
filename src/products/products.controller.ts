import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProductCategory } from '@prisma/client';

@ApiTags('products')
@Controller('v1')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('shops/:shopId/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  async create(
    @Param('shopId') shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(shopId, dto);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.id, id, dto);
  }

  @Get('cities/:slug/products')
  @ApiOperation({ summary: 'Get products by city' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false, enum: ProductCategory })
  @ApiQuery({ name: 'from_price', required: false, type: Number })
  @ApiQuery({ name: 'to_price', required: false, type: Number })
  @ApiQuery({ name: 'purity', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async findByCitySlug(
    @Param('slug') slug: string,
    @Query('q') q?: string,
    @Query('category') category?: ProductCategory,
    @Query('from_price') fromPrice?: string,
    @Query('to_price') toPrice?: string,
    @Query('purity') purity?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return this.productsService.findByCitySlug(slug, {
      q,
      category,
      fromPrice: fromPrice ? parseInt(fromPrice) : undefined,
      toPrice: toPrice ? parseInt(toPrice) : undefined,
      purity,
      page: page ? parseInt(page) : undefined,
      perPage: perPage ? parseInt(perPage) : undefined,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'category', required: false, enum: ProductCategory })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async search(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('category') category?: ProductCategory,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return this.productsService.search({
      q,
      city,
      category,
      page: page ? parseInt(page) : undefined,
      perPage: perPage ? parseInt(perPage) : undefined,
    });
  }

  @Get('products/featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findFeatured(@Query('limit') limit?: string) {
    return this.productsService.findFeatured(limit ? parseInt(limit) : undefined);
  }
}
