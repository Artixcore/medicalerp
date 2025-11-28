import { PartialType } from '@nestjs/mapped-types';
import { CreateClaimDto } from './create-claim.dto';
import { IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {
  @IsOptional()
  @IsDateString()
  submittedDate?: string;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsString()
  denialReason?: string;
}

