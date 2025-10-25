import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('leads')
@Controller('v1')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('products/:id/lead')
  @ApiOperation({ summary: 'Create a lead for a product' })
  async create(
    @Param('id') productId: string,
    @Body() dto: CreateLeadDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.leadsService.create(productId, dto, userId);
  }

  @Get('shops/:shopId/leads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leads for a shop' })
  async findByShop(@Param('shopId') shopId: string) {
    return this.leadsService.findByShop(shopId);
  }
}
