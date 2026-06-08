import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';

@Module({
  imports: [PrismaModule],
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule {}
