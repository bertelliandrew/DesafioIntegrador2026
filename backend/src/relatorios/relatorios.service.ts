import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async gerarRelatorio() {
    const [clientes, planos, assinaturas] = await Promise.all([
      this.prisma.cliente.findMany(),
      this.prisma.plano.findMany(),
      this.prisma.assinatura.findMany({
        include: {
          cliente: { select: { estado: true } },
          plano: { select: { id: true, nome: true } },
        },
      }),
    ]);

    const assinaturasAtivas = assinaturas.filter((assinatura) => assinatura.status === 'ativa');
    const assinaturasCanceladas = assinaturas.filter((assinatura) => assinatura.status === 'cancelada');

    const receitaMensalAtiva = assinaturasAtivas.reduce(
      (total, assinatura) => total + assinatura.valorMensal,
      0,
    );

    const taxaCancelamento =
      assinaturas.length === 0
        ? 0
        : (assinaturasCanceladas.length / assinaturas.length) * 100;

    const assinaturasPorPlano = planos.map((plano) => {
      const relacionadas = assinaturas.filter((assinatura) => assinatura.planoId === plano.id);
      const ativas = relacionadas.filter((assinatura) => assinatura.status === 'ativa');
      const canceladas = relacionadas.filter((assinatura) => assinatura.status === 'cancelada');

      return {
        planoId: plano.id,
        nomePlano: plano.nome,
        total: relacionadas.length,
        ativas: ativas.length,
        canceladas: canceladas.length,
        receitaMensalAtiva: this.formatarMoeda(
          ativas.reduce((total, assinatura) => total + assinatura.valorMensal, 0),
        ),
      };
    });

    const planoMaisContratado =
      [...assinaturasPorPlano].sort((a, b) => b.total - a.total)[0] || null;

    return {
      resumo: {
        totalClientes: clientes.length,
        totalPlanos: planos.length,
        totalAssinaturas: assinaturas.length,
        assinaturasAtivas: assinaturasAtivas.length,
        assinaturasCanceladas: assinaturasCanceladas.length,
        taxaCancelamento: this.formatarMoeda(taxaCancelamento),
        receitaMensalAtiva: this.formatarMoeda(receitaMensalAtiva),
      },
      assinaturasPorPlano,
      planoMaisContratado,
      cancelamentosPorMotivo: this.contarPorCampo(assinaturasCanceladas, 'motivoCancelamento'),
      clientesPorEstado: this.contarPorCampo(clientes, 'estado'),
    };
  }

  private formatarMoeda(valor: number) {
    return Number(valor.toFixed(2));
  }

  private contarPorCampo(lista: any[], campo: string) {
    return lista.reduce<Record<string, number>>((acc, item) => {
      const chave = item[campo] || 'Não informado';
      acc[chave] = (acc[chave] || 0) + 1;
      return acc;
    }, {});
  }
}
