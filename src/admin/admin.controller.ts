import { Controller, Get, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('shops')
  @ApiOperation({ summary: 'Get all shops (admin only)' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  async getAllShops(
    @CurrentUser() user: any,
    @Query('verified') verified?: string,
  ) {
    const verifiedBool = verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.adminService.getAllShops(user.id, verifiedBool);
  }

  @Put('shops/:id/verify')
  @ApiOperation({ summary: 'Verify or unverify a shop (admin only)' })
  async verifyShop(
    @CurrentUser() user: any,
    @Param('id') shopId: string,
    @Body() body: { verified: boolean },
  ) {
    return this.adminService.verifyShop(user.id, shopId, body.verified);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions (admin only)' })
  async getAllTransactions(@CurrentUser() user: any) {
    return this.adminService.getAllTransactions(user.id);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get all leads (admin only)' })
  async getAllLeads(@CurrentUser() user: any) {
    return this.adminService.getAllLeads(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (admin only)' })
  async getStats(@CurrentUser() user: any) {
    return this.adminService.getStats(user.id);
  }
}
