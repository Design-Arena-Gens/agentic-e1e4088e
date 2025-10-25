import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto } from './dto/create-shop.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('shops')
@Controller('v1/shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new shop' })
  async create(@CurrentUser() user: any, @Body() dto: CreateShopDto) {
    return this.shopsService.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my shops' })
  async findMyShops(@CurrentUser() user: any) {
    return this.shopsService.findMyShops(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop by ID' })
  async findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shop' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(user.id, id, dto);
  }
}
