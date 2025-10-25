import { Controller, Post, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateMembershipCheckoutDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('v1')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('shops/:id/membership/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create membership checkout' })
  async createMembershipCheckout(
    @Param('id') shopId: string,
    @Body() dto: CreateMembershipCheckoutDto,
  ) {
    return this.paymentsService.createMembershipCheckout(
      shopId,
      dto.plan,
      dto.amountInPaise,
    );
  }

  @Post('payments/webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    return this.paymentsService.handleWebhook(signature, payload);
  }
}
