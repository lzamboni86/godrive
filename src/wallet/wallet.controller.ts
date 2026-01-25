import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { UseCreditsDto } from './dto/use-credits.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.walletService.getTransactions(userId);
  }

  @Get('check-balance')
  async checkBalance(@Req() req: any, @Query('amount') amount: string) {
    const userId = req.user.sub || req.user.id;
    return this.walletService.checkAvailableBalance(userId, Number(amount));
  }

  @Post('use-credits')
  async useCredits(@Req() req: any, @Body() dto: UseCreditsDto) {
    const userId = req.user.sub || req.user.id;
    const bookingId = dto.bookingId ?? `booking_${Date.now()}`;

    const lockedTransactions = await this.walletService.useCredits(userId, dto.amount, dto.description, bookingId);
    return lockedTransactions[0];
  }

  @Patch('transactions/:id/status')
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTransactionStatusDto) {
    const userId = req.user.sub || req.user.id;

    return this.walletService.updateStatus(userId, id, dto.status as any);
  }

  @Post('transactions/:id/release')
  async release(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.id;
    return this.walletService.updateStatus(userId, id, 'AVAILABLE' as any);
  }

  @Post('transactions/:id/mark-used')
  async markUsed(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.id;
    return this.walletService.updateStatus(userId, id, 'USED' as any);
  }
}
