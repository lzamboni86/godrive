import { IsString, IsEmail, IsOptional, IsNotEmpty, validate } from 'class-validator';
import { isValidCpf } from '../../utils/cpf-validator';

export class RegisterStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  addressStreet?: string;

  @IsString()
  @IsOptional()
  addressNumber?: string;

  @IsString()
  @IsOptional()
  addressZipCode?: string;

  @IsString()
  @IsOptional()
  addressNeighborhood?: string;

  @IsString()
  @IsOptional()
  addressCity?: string;

  @IsString()
  @IsOptional()
  addressState?: string;

  @IsString()
  @IsOptional()
  addressComplement?: string;
}
