import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipCheckoutDto {
  @ApiProperty()
  @IsString()
  plan: string;

  @ApiProperty()
  @IsNumber()
  amountInPaise: number;
}

export class RazorpayWebhookDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  payload: any;
}
