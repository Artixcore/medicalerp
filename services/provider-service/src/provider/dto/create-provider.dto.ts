import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderType } from '@shared/types';

class AddressDto {
  @IsString()
  street1: string;

  @IsOptional()
  @IsString()
  street2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  county?: string;
}

class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phone: string;
}

class ContactInfoDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}

class CredentialDto {
  @IsString()
  type: string;

  @IsString()
  number: string;

  @IsString()
  issuingOrganization: string;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsBoolean()
  isActive: boolean;
}

export class CreateProviderDto {
  @IsOptional()
  @IsString()
  npi?: string;

  @IsString()
  name: string;

  @IsEnum(ProviderType)
  type: ProviderType;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CredentialDto)
  credentials?: Credential[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

