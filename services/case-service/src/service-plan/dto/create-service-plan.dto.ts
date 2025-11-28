import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ServicePlanStatus } from '@shared/types';

export class CreateServicePlanDto {
  @IsUUID()
  caseId: string;

  @IsOptional()
  @IsEnum(ServicePlanStatus)
  status?: ServicePlanStatus;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

