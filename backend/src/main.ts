import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const primeiraMensagem = errors
          .map((erro) => Object.values(erro.constraints || {})[0])
          .find(Boolean);

        return new BadRequestException({
          erro: primeiraMensagem || 'Dados inválidos.',
        });
      },
    }),
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`Servidor rodando em http://localhost:${port}`);
}

bootstrap();
