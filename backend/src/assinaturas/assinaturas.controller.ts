import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CancelarAssinaturaDto } from '../dto/cancelar-assinatura.dto';
import { CriarAssinaturaDto } from '../dto/criar-assinatura.dto';
import { AssinaturasService } from './assinaturas.service';

@Controller('assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Get()
  listar() {
    return this.assinaturasService.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.assinaturasService.buscar(id);
  }

  @Post()
  criar(@Body() dados: CriarAssinaturaDto) {
    return this.assinaturasService.criar(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: CriarAssinaturaDto) {
    return this.assinaturasService.atualizar(id, dados);
  }

  @Put(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Body() dados: CancelarAssinaturaDto) {
    return this.assinaturasService.cancelar(id, dados);
  }

  @Put(':id/reativar')
  reativar(@Param('id', ParseIntPipe) id: number) {
    return this.assinaturasService.reativar(id);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.assinaturasService.remover(id);
  }
}
