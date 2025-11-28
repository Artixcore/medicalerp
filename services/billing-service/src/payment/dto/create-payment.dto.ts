import { IsUUID, IsNumber, IsDateString, IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '@shared/types';

export class CreatePaymentDto {
  @IsUUID()
  claimId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  referenceNumber: string;
}

