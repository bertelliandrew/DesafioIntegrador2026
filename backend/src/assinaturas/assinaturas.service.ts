import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CancelarAssinaturaDto } from '../dto/cancelar-assinatura.dto';
import { CriarAssinaturaDto } from '../dto/criar-assinatura.dto';
import { PrismaService } from '../prisma/prisma.service';

const includeAssinatura = {
  cliente: { select: { nome: true } },
  plano: { select: { nome: true } },
};

@Injectable()
export class AssinaturasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const assinaturas = await this.prisma.assinatura.findMany({
      include: includeAssinatura,
      orderBy: { criadoEm: 'desc' },
    });

    return assinaturas.map((assinatura) => this.serializarAssinatura(assinatura));
  }

  async buscar(id: number) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { id },
      include: includeAssinatura,
    });

    if (!assinatura) {
      throw new NotFoundException({ erro: 'Assinatura não encontrada.' });
    }

    return this.serializarAssinatura(assinatura);
  }

  async criar(dados: CriarAssinaturaDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: Number(dados.clienteId) } });
    if (!cliente) {
      throw new BadRequestException({ erro: 'Cliente não encontrado.' });
    }

    const plano = await this.prisma.plano.findUnique({ where: { id: Number(dados.planoId) } });
    if (!plano) {
      throw new BadRequestException({ erro: 'Plano de firewall não encontrado.' });
    }

    if (dados.quantidadeFirewalls > plano.limiteDispositivos) {
      throw new BadRequestException({ erro: 'A quantidade informada ultrapassa o limite do plano.' });
    }

    const assinatura = await this.prisma.assinatura.create({
      data: {
        clienteId: cliente.id,
        planoId: plano.id,
        quantidadeFirewalls: dados.quantidadeFirewalls,
        ciclo: dados.ciclo || 'mensal',
        status: 'ativa',
        valorMensal: Number((plano.precoMensal * dados.quantidadeFirewalls).toFixed(2)),
      },
      include: includeAssinatura,
    });

    return this.serializarAssinatura(assinatura);
  }

  async atualizar(id: number, dados: CriarAssinaturaDto) {
    const existente = await this.prisma.assinatura.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException({ erro: 'Assinatura não encontrada.' });
    }

    if (existente.status === 'cancelada') {
      throw new BadRequestException({ erro: 'Assinaturas canceladas não podem ser alteradas.' });
    }

    const cliente = await this.prisma.cliente.findUnique({ where: { id: Number(dados.clienteId) } });
    if (!cliente) {
      throw new BadRequestException({ erro: 'Cliente não encontrado.' });
    }

    const plano = await this.prisma.plano.findUnique({ where: { id: Number(dados.planoId) } });
    if (!plano) {
      throw new BadRequestException({ erro: 'Plano de firewall não encontrado.' });
    }

    if (dados.quantidadeFirewalls > plano.limiteDispositivos) {
      throw new BadRequestException({ erro: 'A quantidade informada ultrapassa o limite do plano.' });
    }

    const assinatura = await this.prisma.assinatura.update({
      where: { id },
      data: {
        clienteId: cliente.id,
        planoId: plano.id,
        quantidadeFirewalls: dados.quantidadeFirewalls,
        ciclo: dados.ciclo || 'mensal',
        valorMensal: Number((plano.precoMensal * dados.quantidadeFirewalls).toFixed(2)),
      },
      include: includeAssinatura,
    });

    return this.serializarAssinatura(assinatura);
  }

  async cancelar(id: number, dados: CancelarAssinaturaDto) {
    const existente = await this.prisma.assinatura.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException({ erro: 'Assinatura não encontrada.' });
    }

    if (existente.status === 'cancelada') {
      throw new BadRequestException({ erro: 'Essa assinatura já está cancelada.' });
    }

    const assinatura = await this.prisma.assinatura.update({
      where: { id },
      data: {
        status: 'cancelada',
        motivoCancelamento: dados.motivoCancelamento.trim(),
        canceladoEm: new Date(),
      },
      include: includeAssinatura,
    });

    return this.serializarAssinatura(assinatura);
  }

  async reativar(id: number) {
    const existente = await this.prisma.assinatura.findUnique({
      where: { id },
      include: { plano: true },
    });

    if (!existente) {
      throw new NotFoundException({ erro: 'Assinatura não encontrada.' });
    }

    const assinatura = await this.prisma.assinatura.update({
      where: { id },
      data: {
        status: 'ativa',
        motivoCancelamento: null,
        canceladoEm: null,
      },
      include: includeAssinatura,
    });

    return this.serializarAssinatura(assinatura);
  }

  async remover(id: number) {
    await this.buscar(id);
    await this.prisma.assinatura.delete({ where: { id } });
    return { mensagem: 'Assinatura removida com sucesso.' };
  }

  private serializarAssinatura(assinatura: any) {
    return {
      ...assinatura,
      nomeCliente: assinatura.cliente?.nome,
      nomePlano: assinatura.plano?.nome,
    };
  }
}
