import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UseCreditsDto {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}
