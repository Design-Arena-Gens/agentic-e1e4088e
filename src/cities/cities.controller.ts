import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CitiesService } from './cities.service';

@ApiTags('cities')
@Controller('v1/cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cities' })
  async findAll() {
    return this.citiesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get city by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.citiesService.findBySlug(slug);
  }

  @Get(':slug/shops')
  @ApiOperation({ summary: 'Get shops in a city' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  async findShopsByCity(
    @Param('slug') slug: string,
    @Query('verified') verified?: string,
  ) {
    const verifiedBool = verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.citiesService.findShopsByCity(slug, verifiedBool);
  }
}
