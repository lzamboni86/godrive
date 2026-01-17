import { IsString, IsOptional } from 'class-validator';

export class UpdatePayoutDto {
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
