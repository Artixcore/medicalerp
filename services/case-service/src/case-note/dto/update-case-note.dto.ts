import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseNoteDto } from './create-case-note.dto';

export class UpdateCaseNoteDto extends PartialType(CreateCaseNoteDto) {}

