import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  inicio() {
    return {
      mensagem: 'API FirewallSign rodando com NestJS.',
      tema: 'Assinaturas de planos de firewall',
      endpoints: ['/api/clientes', '/api/planos', '/api/assinaturas', '/api/relatorios'],
    };
  }
}
