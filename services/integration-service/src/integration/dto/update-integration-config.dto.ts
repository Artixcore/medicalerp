import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegrationConfigDto } from './create-integration-config.dto';

export class UpdateIntegrationConfigDto extends PartialType(
  CreateIntegrationConfigDto,
) {}

