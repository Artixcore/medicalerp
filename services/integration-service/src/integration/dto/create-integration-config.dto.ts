import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { IntegrationType } from '@shared/types';

export class CreateIntegrationConfigDto {
  @IsString()
  name: string;

  @IsEnum(IntegrationType)
  type: IntegrationType;

  @IsString()
  endpoint: string;

  @IsObject()
  credentials: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

