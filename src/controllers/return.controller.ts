import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('return')
export class ReturnController {
  @Get()
  async handleReturn(
    @Res() res: Response,
    @Query('collection_status') collectionStatus?: string,
    @Query('preference_id') preferenceId?: string,
    @Query('payment_id') paymentId?: string,
  ) {
    // Servir a página HTML de retorno
    res.sendFile(join(__dirname, '..', '..', 'public', 'return.html'));
  }
}
