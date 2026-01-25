import { IsEnum } from 'class-validator';

export enum WalletTransactionStatusDto {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
}

export class UpdateTransactionStatusDto {
  @IsEnum(WalletTransactionStatusDto)
  status: WalletTransactionStatusDto;
}
