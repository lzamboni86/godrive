import { IsString, IsArray, IsNumber, IsEnum } from 'class-validator';

export enum ScheduleStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REQUESTED = 'REQUESTED'
}

export class ScheduleRequestDto {
  @IsString()
  studentId: string;

  @IsString()
  instructorId: string;

  @IsArray()
  lessons: {
    date: string;
    time: string;
    duration: number;
    price: number;
  }[];

  @IsNumber()
  totalAmount: number;

  @IsEnum(ScheduleStatus)
  status: ScheduleStatus;
}
