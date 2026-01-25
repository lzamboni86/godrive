import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth && (client.handshake.auth as any).token) ||
      (client.handshake.query && (client.handshake.query as any).token);

    if (!token || typeof token !== 'string') {
      client.disconnect(true);
      return;
    }

    try {
      const payload: any = await this.jwtService.verifyAsync(token);
      const userId = payload?.sub || payload?.id;

      if (!userId) {
        client.disconnect(true);
        return;
      }

      await client.join(String(userId));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    void client;
  }
}
