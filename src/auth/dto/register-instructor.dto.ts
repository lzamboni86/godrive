import { IsString, IsEmail, IsOptional, IsNotEmpty, IsNumber, IsEnum, validate } from 'class-validator';
import { isValidCpf } from '../../utils/cpf-validator';
import { Gender } from '@prisma/client';
import { Transmission, EngineType } from '@prisma/client';

export class RegisterInstructorDto {
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
  cnh: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @IsString()
  @IsOptional()
  vehicleMake?: string;

  @IsNumber()
  @IsOptional()
  vehicleYear?: number;

  @IsEnum(Transmission)
  @IsOptional()
  transmission?: 'MANUAL' | 'AUTOMATIC';

  @IsEnum(EngineType)
  @IsOptional()
  engineType?: 'COMBUSTION' | 'ELECTRIC';

  @IsString()
  @IsNotEmpty()
  vehiclePlate: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  neighborhoodReside?: string;

  @IsString()
  @IsOptional()
  neighborhoodTeach?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @IsNumber()
  @IsNotEmpty()
  hourlyRate: number;

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
