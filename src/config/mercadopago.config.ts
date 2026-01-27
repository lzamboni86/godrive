export const mercadoPagoConfig = {
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  publicKey: process.env.MP_PUBLIC_KEY || '',
  clientId: process.env.MP_CLIENT_ID || '',
  clientSecret: process.env.MP_CLIENT_SECRET || '',
  webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
  
  get isSandbox(): boolean {
    // Forçar produção: ignorar token TEST- e retornar sempre false
    return false;
  },
  
  get isConfigured(): boolean {
    return !!this.accessToken;
  },
  
  get hasWebhookSecret(): boolean {
    return !!this.webhookSecret;
  },

  logConfig(): void {
    console.log('💳 [MP-CONFIG] Configuração do Mercado Pago:');
    console.log('  - ACCESS_TOKEN:', this.accessToken ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - PUBLIC_KEY:', this.publicKey ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - CLIENT_ID:', this.clientId ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - CLIENT_SECRET:', this.clientSecret ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - WEBHOOK_SECRET:', this.webhookSecret ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - Modo Sandbox:', this.isSandbox ? 'Sim' : 'Não');
  }
};
