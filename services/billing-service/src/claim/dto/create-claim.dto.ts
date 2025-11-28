import {
  IsUUID,
  IsDateString,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ClaimStatus, Payer } from '@shared/types';

export class CreateClaimDto {
  @IsOptional()
  @IsString()
  claimNumber?: string;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsDateString()
  serviceDate: string;

  @IsInt()
  units: number;

  @IsNumber()
  unitRate: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsEnum(Payer)
  payer: Payer;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsString()
  denialReason?: string;
}

