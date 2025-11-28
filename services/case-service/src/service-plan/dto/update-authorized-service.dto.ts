import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthorizedServiceDto } from './create-authorized-service.dto';

export class UpdateAuthorizedServiceDto extends PartialType(
  CreateAuthorizedServiceDto,
) {}

