import { IsString, IsNotEmpty } from 'class-validator';

export class ReleasePaymentDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;
}