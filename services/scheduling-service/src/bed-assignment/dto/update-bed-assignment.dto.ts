import { PartialType } from '@nestjs/mapped-types';
import { CreateBedAssignmentDto } from './create-bed-assignment.dto';

export class UpdateBedAssignmentDto extends PartialType(CreateBedAssignmentDto) {}

