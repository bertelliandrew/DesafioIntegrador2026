import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CriarPlanoDto } from '../dto/criar-plano.dto';
import { PlanosService } from './planos.service';

@Controller('planos')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Get()
  listar() {
    return this.planosService.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.planosService.buscar(id);
  }

  @Post()
  criar(@Body() dados: CriarPlanoDto) {
    return this.planosService.criar(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: CriarPlanoDto) {
    return this.planosService.atualizar(id, dados);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.planosService.remover(id);
  }
}
