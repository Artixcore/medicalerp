import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus, AppointmentType } from '@shared/types';

export class CreateAppointmentDto {
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
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

