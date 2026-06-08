import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CriarPlanoDto } from '../dto/criar-plano.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const planos = await this.prisma.plano.findMany({ orderBy: { precoMensal: 'asc' } });
    return planos.map((plano) => this.serializarPlano(plano));
  }

  async buscar(id: number) {
    const plano = await this.prisma.plano.findUnique({ where: { id } });
    if (!plano) {
      throw new NotFoundException({ erro: 'Plano de firewall não encontrado.' });
    }
    return this.serializarPlano(plano);
  }

  async criar(dados: CriarPlanoDto) {
    const plano = await this.prisma.plano.create({
      data: {
        nome: dados.nome.trim(),
        descricao: dados.descricao.trim(),
        precoMensal: Number(dados.precoMensal),
        limiteDispositivos: Number(dados.limiteDispositivos),
        suporte: dados.suporte.trim(),
        recursos: JSON.stringify(this.normalizarRecursos(dados.recursos)),
      },
    });

    return this.serializarPlano(plano);
  }

  async atualizar(id: number, dados: CriarPlanoDto) {
    await this.buscar(id);

    const plano = await this.prisma.plano.update({
      where: { id },
      data: {
        nome: dados.nome.trim(),
        descricao: dados.descricao.trim(),
        precoMensal: Number(dados.precoMensal),
        limiteDispositivos: Number(dados.limiteDispositivos),
        suporte: dados.suporte.trim(),
        recursos: JSON.stringify(this.normalizarRecursos(dados.recursos)),
      },
    });

    const assinaturasAtivas = await this.prisma.assinatura.findMany({
      where: { planoId: id, status: 'ativa' },
      select: { id: true, quantidadeFirewalls: true },
    });

    await Promise.all(
      assinaturasAtivas.map((assinatura) =>
        this.prisma.assinatura.update({
          where: { id: assinatura.id },
          data: {
            valorMensal: Number((dados.precoMensal * assinatura.quantidadeFirewalls).toFixed(2)),
          },
        }),
      ),
    );

    return this.serializarPlano(plano);
  }

  async remover(id: number) {
    await this.buscar(id);

    try {
      await this.prisma.plano.delete({ where: { id } });
      return { mensagem: 'Plano removido com sucesso.' };
    } catch (erro) {
      throw new BadRequestException({ erro: 'Não é possível remover um plano que possui assinaturas.' });
    }
  }


  private normalizarRecursos(recursos: string[] | string | undefined) {
    if (Array.isArray(recursos)) {
      return recursos.map((recurso) => String(recurso).trim()).filter(Boolean);
    }

    if (typeof recursos === 'string') {
      return recursos.split(';').map((recurso) => recurso.trim()).filter(Boolean);
    }

    return [];
  }

  private serializarPlano(plano: any) {
    let recursos: string[] = [];

    try {
      recursos = JSON.parse(plano.recursos || '[]');
    } catch {
      recursos = [];
    }

    return {
      ...plano,
      recursos,
    };
  }
}
