import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard {
  canActivate() {
    // Por enquanto, permite tudo (sem autenticação)
    // Futuro: implementar verificação JWT real
    return true;
  }
}
