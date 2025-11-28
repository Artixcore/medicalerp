import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus, Program } from '@shared/types';

class RateScheduleDto {
  @IsString()
  serviceCode: string;

  @IsNumber()
  unitRate: number;

  @IsDateString()
  effectiveDate: string;
}

export class CreateContractDto {
  @IsUUID()
  providerId: string;

  @IsEnum(Program)
  program: Program;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateScheduleDto)
  rateSchedule?: RateScheduleDto[];

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

