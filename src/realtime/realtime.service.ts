import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(userId).emit(event, payload);
  }
}
