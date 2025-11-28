import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { CaseStatus, Priority, Program } from '@shared/types';

export class CreateCaseDto {
  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  assignedTo: string;

  @IsEnum(Program)
  program: Program;

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsDateString()
  openedDate: string;

  @IsOptional()
  @IsDateString()
  closedDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedCases?: string[];
}

