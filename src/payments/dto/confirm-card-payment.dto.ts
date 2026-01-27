import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConfirmCardPaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsString()
  @IsNotEmpty()
  issuerId: string;

  @IsNumber()
  installments: number;

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
