import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('schedule/success')
  scheduleSuccess(@Query() query: any, @Res() res: Response) {
    return this.renderScheduleReturnPage('success', query, res);
  }

  @Get('schedule/pending')
  schedulePending(@Query() query: any, @Res() res: Response) {
    return this.renderScheduleReturnPage('pending', query, res);
  }

  @Get('schedule/failure')
  scheduleFailure(@Query() query: any, @Res() res: Response) {
    return this.renderScheduleReturnPage('failure', query, res);
  }

  private renderScheduleReturnPage(status: 'success' | 'pending' | 'failure', query: any, res: Response) {
    const params = new URLSearchParams();

    if (query?.external_reference) params.set('external_reference', String(query.external_reference));
    if (query?.payment_id) params.set('payment_id', String(query.payment_id));
    if (query?.collection_id) params.set('collection_id', String(query.collection_id));
    if (query?.merchant_order_id) params.set('merchant_order_id', String(query.merchant_order_id));
    if (query?.preference_id) params.set('preference_id', String(query.preference_id));
    if (query?.collection_status) params.set('collection_status', String(query.collection_status));

    const deepLink = `godrive://schedule/${status}?${params.toString()}`;

    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GoDrive</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; padding: 24px;">
    <h2>Voltando para o app...</h2>
    <p>Se não abrir automaticamente, toque no botão abaixo.</p>
    <p><a href="${deepLink}" style="display:inline-block;padding:12px 16px;background:#10B981;color:#fff;border-radius:10px;text-decoration:none;">Abrir GoDrive</a></p>
    <script>
      window.location.href = ${JSON.stringify(deepLink)};
    </script>
  </body>
</html>`);
  }
}
