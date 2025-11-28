import { IsUUID, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BedStatus } from '@shared/types';

export class CreateBedAssignmentDto {
  @IsUUID()
  bedId: string;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsDateString()
  checkInDate: string;

  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

