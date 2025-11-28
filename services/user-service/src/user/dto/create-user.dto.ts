import { IsEmail, IsString, IsEnum, IsArray, MinLength } from 'class-validator';
import { Role } from '@shared/types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}

