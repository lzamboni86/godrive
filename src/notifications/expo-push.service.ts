import { Injectable } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class ExpoPushService {
  async send(to: string, title: string, body: string, data?: Record<string, any>) {
    if (!to) return;

    const payload = JSON.stringify({
      to,
      title,
      body,
      data: data || {},
      sound: 'default',
    });

    await new Promise<void>((resolve) => {
      const req = https.request(
        {
          hostname: 'exp.host',
          path: '/--/api/v2/push/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          res.on('data', () => undefined);
          res.on('end', () => resolve());
        },
      );

      req.on('error', () => resolve());
      req.write(payload);
      req.end();
    });
  }
}
