import { IsString } from 'class-validator';

export class LessonAdjustmentDto {
  @IsString()
  proposedDate: string;

  @IsString()
  proposedTime: string;
}
