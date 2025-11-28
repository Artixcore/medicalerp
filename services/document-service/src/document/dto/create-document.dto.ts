import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { DocumentType } from '@shared/types';

export class CreateDocumentDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsString()
  fileName: string;

  @IsString()
  fileType: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

