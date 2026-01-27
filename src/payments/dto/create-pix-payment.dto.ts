import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePixPaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  externalReference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  payerEmail?: string;

  @IsString()
  @IsOptional()
  payerName?: string;

  @IsString()
  @IsOptional()
  payerDocumentType?: string;

  @IsString()
  @IsOptional()
  payerDocumentNumber?: string;
}
