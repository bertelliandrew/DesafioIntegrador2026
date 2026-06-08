import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { ClientesModule } from './clientes/clientes.module';
import { PlanosModule } from './planos/planos.module';
import { AssinaturasModule } from './assinaturas/assinaturas.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    PrismaModule,
    ClientesModule,
    PlanosModule,
    AssinaturasModule,
    RelatoriosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
