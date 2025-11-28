import { IsUUID, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { GoalStatus } from '@shared/types';

export class CreateGoalDto {
  @IsUUID()
  servicePlanId: string;

  @IsString()
  description: string;

  @IsDateString()
  targetDate: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}

