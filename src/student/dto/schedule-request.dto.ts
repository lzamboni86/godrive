import { IsString, IsArray, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum ScheduleStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REQUESTED = 'REQUESTED'
}

export enum SchedulePaymentMethod {
  MERCADO_PAGO = 'MERCADO_PAGO',
  WALLET = 'WALLET',
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

  @IsOptional()
  @IsEnum(SchedulePaymentMethod)
  paymentMethod?: SchedulePaymentMethod;
}
