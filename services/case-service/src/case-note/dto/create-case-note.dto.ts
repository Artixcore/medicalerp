import { IsUUID, IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { NoteType } from '@shared/types';

export class CreateCaseNoteDto {
  @IsUUID()
  caseId: string;

  @IsUUID()
  authorId: string;

  @IsEnum(NoteType)
  noteType: NoteType;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;
}

