import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BedStatus } from '@shared/types';

export class CreateBedDto {
  @IsString()
  bedNumber: string;

  @IsString()
  facility: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsString()
  bedType: string;

  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;
}

