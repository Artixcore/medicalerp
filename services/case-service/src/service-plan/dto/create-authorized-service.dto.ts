import {
  IsUUID,
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ServiceAuthorizationStatus } from '@shared/types';

export class CreateAuthorizedServiceDto {
  @IsUUID()
  servicePlanId: string;

  @IsString()
  serviceCode: string;

  @IsString()
  serviceName: string;

  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsInt()
  units: number;

  @IsNumber()
  unitRate: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ServiceAuthorizationStatus)
  status?: ServiceAuthorizationStatus;
}

