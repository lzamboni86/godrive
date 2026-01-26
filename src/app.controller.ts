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

  @Get('reset-password')
  resetPassword(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      res.status(400);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GoDrive - Redefinir senha</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; padding: 24px;">
    <h2>Link inválido</h2>
    <p>O token de redefinição não foi informado.</p>
  </body>
</html>`);
    }

    const deepLink = `godrive://app/reset-password?token=${encodeURIComponent(token)}`;

    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GoDrive - Redefinir senha</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background:#F3F4F6; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background:#fff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
      <h2 style="margin: 0 0 8px 0; color:#111827;">Redefinir senha</h2>
      <p style="margin: 0 0 20px 0; color:#6B7280;">Digite sua nova senha abaixo.</p>

      <div id="msg" style="display:none; padding: 12px 14px; border-radius: 12px; margin-bottom: 16px;"></div>

      <form id="form" style="display:flex; flex-direction:column; gap: 12px;">
        <label style="display:flex; flex-direction:column; gap:6px; color:#374151; font-weight:600;">
          Nova senha
          <input id="pwd" type="password" autocomplete="new-password" style="padding: 12px 14px; border:1px solid #D1D5DB; border-radius: 12px; font-size: 16px;" />
        </label>

        <label style="display:flex; flex-direction:column; gap:6px; color:#374151; font-weight:600;">
          Confirmar nova senha
          <input id="pwd2" type="password" autocomplete="new-password" style="padding: 12px 14px; border:1px solid #D1D5DB; border-radius: 12px; font-size: 16px;" />
        </label>

        <button id="btn" type="submit" style="margin-top: 8px; padding: 12px 14px; background:#1E3A8A; color:#fff; border:0; border-radius: 12px; font-size: 16px; font-weight: 700; cursor:pointer;">
          Redefinir senha
        </button>
      </form>

      <div style="margin-top: 16px;">
        <a href="${deepLink}" style="display:inline-block; color:#1E3A8A; text-decoration:none; font-weight:600;">Abrir no app GoDrive</a>
      </div>
    </div>

    <script>
      const token = ${JSON.stringify(token)};
      const form = document.getElementById('form');
      const msg = document.getElementById('msg');
      const pwd = document.getElementById('pwd');
      const pwd2 = document.getElementById('pwd2');
      const btn = document.getElementById('btn');

      function showMessage(text, type) {
        msg.style.display = 'block';
        msg.textContent = text;
        msg.style.background = type === 'success' ? '#ECFDF5' : '#FEF2F2';
        msg.style.color = type === 'success' ? '#065F46' : '#991B1B';
        msg.style.border = type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA';
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const p1 = (pwd.value || '').trim();
        const p2 = (pwd2.value || '').trim();

        if (!p1 || !p2) {
          showMessage('Preencha os dois campos de senha.', 'error');
          return;
        }

        if (p1.length < 6) {
          showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
          return;
        }

        if (p1 !== p2) {
          showMessage('As senhas não coincidem.', 'error');
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
          const resp = await fetch('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: p1 }),
          });

          const data = await resp.json().catch(() => ({}));

          if (!resp.ok) {
            const message = data?.message || 'Não foi possível redefinir a senha. Solicite um novo link.';
            showMessage(message, 'error');
            return;
          }

          showMessage('Senha redefinida com sucesso! Você já pode voltar e fazer login.', 'success');
          form.style.display = 'none';
        } catch (err) {
          showMessage('Erro ao conectar no servidor. Tente novamente.', 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Redefinir senha';
        }
      });
    </script>
  </body>
</html>`);
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
