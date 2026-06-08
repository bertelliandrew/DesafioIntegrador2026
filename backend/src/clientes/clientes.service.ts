import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CriarClienteDto } from '../dto/criar-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.cliente.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  async buscar(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException({ erro: 'Cliente não encontrado.' });
    }
    return cliente;
  }

  async criar(dados: CriarClienteDto) {
    try {
      return await this.prisma.cliente.create({
        data: {
          nome: dados.nome.trim(),
          email: dados.email.trim(),
          cidade: dados.cidade.trim(),
          estado: dados.estado.trim(),
          pais: dados.pais.trim(),
        },
      });
    } catch (erro) {
      this.tratarErroPrisma(erro);
    }
  }

  async atualizar(id: number, dados: CriarClienteDto) {
    await this.buscar(id);

    try {
      return await this.prisma.cliente.update({
        where: { id },
        data: {
          nome: dados.nome.trim(),
          email: dados.email.trim(),
          cidade: dados.cidade.trim(),
          estado: dados.estado.trim(),
          pais: dados.pais.trim(),
        },
      });
    } catch (erro) {
      this.tratarErroPrisma(erro);
    }
  }

  async remover(id: number) {
    await this.buscar(id);

    try {
      await this.prisma.cliente.delete({ where: { id } });
      return { mensagem: 'Cliente removido com sucesso.' };
    } catch (erro) {
      throw new BadRequestException({ erro: 'Não é possível remover um cliente que possui assinaturas.' });
    }
  }

  private tratarErroPrisma(erro: unknown): never {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
      throw new BadRequestException({ erro: 'Já existe um cliente com este e-mail.' });
    }

    throw new BadRequestException({ erro: 'Erro ao salvar cliente.' });
  }
}
