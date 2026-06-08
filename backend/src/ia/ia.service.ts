import { Injectable } from '@nestjs/common';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

type EntradaIa = {
  clienteId: number;
  nome: string;
  email: string;
  estado: string;
  total_assinaturas: number;
  assinaturas_ativas: number;
  assinaturas_canceladas: number;
  valor_mensal_total: number;
  quantidade_firewalls_total: number;
  usa_ciclo_anual: number;
  maior_preco_plano: number;
  dias_cliente: number;
};

@Injectable()
export class IaService {
  constructor(private readonly prisma: PrismaService) {}

  async analisarClientes() {
    const clientes = await this.prisma.cliente.findMany({
      include: {
        assinaturas: {
          include: {
            plano: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    const entrada = clientes.map((cliente) => this.montarEntrada(cliente));
    const resultadoPython = this.executarPython(entrada);

    if (resultadoPython) {
      return resultadoPython;
    }

    return this.gerarRespostaFallback(entrada);
  }

  private montarEntrada(cliente: any): EntradaIa {
    const assinaturas = cliente.assinaturas || [];
    const ativas = assinaturas.filter((assinatura: any) => assinatura.status === 'ativa');
    const canceladas = assinaturas.filter((assinatura: any) => assinatura.status === 'cancelada');

    const valorMensalTotal = assinaturas.reduce(
      (total: number, assinatura: any) => total + Number(assinatura.valorMensal || 0),
      0,
    );

    const quantidadeFirewallsTotal = assinaturas.reduce(
      (total: number, assinatura: any) => total + Number(assinatura.quantidadeFirewalls || 0),
      0,
    );

    const usaCicloAnual = assinaturas.some((assinatura: any) => assinatura.ciclo === 'anual') ? 1 : 0;

    const maiorPrecoPlano = assinaturas.reduce((maior: number, assinatura: any) => {
      const preco = Number(assinatura.plano?.precoMensal || 0);
      return preco > maior ? preco : maior;
    }, 0);

    return {
      clienteId: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      estado: cliente.estado,
      total_assinaturas: assinaturas.length,
      assinaturas_ativas: ativas.length,
      assinaturas_canceladas: canceladas.length,
      valor_mensal_total: Number(valorMensalTotal.toFixed(2)),
      quantidade_firewalls_total: quantidadeFirewallsTotal,
      usa_ciclo_anual: usaCicloAnual,
      maior_preco_plano: maiorPrecoPlano,
      dias_cliente: this.calcularDias(cliente.criadoEm),
    };
  }

  private executarPython(entrada: EntradaIa[]) {
    const script = join(process.cwd(), '..', 'ia', 'prever_clientes.py');
    const payload = JSON.stringify(entrada);

    const tentativas = ['python', 'py', 'python3'];

    for (const comando of tentativas) {
      const resultado = spawnSync(comando, [script], {
        input: payload,
        encoding: 'utf-8',
        timeout: 20000,
      });

      if (resultado.status === 0 && resultado.stdout) {
        try {
          return JSON.parse(resultado.stdout);
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  private gerarRespostaFallback(entrada: EntradaIa[]) {
    const clientes = entrada
      .map((cliente) => {
        const risco = Math.min(
          95,
          cliente.assinaturas_canceladas * 45 +
            (cliente.total_assinaturas === 0 ? 15 : 0) +
            (cliente.assinaturas_ativas === 0 && cliente.total_assinaturas > 0 ? 30 : 0),
        );

        const compra = Math.min(
          95,
          cliente.assinaturas_ativas * 25 +
            cliente.usa_ciclo_anual * 15 +
            (cliente.valor_mensal_total > 500 ? 25 : 10),
        );

        return {
          clienteId: cliente.clienteId,
          nome: cliente.nome,
          email: cliente.email,
          estado: cliente.estado,
          riscoChurn: Number(risco.toFixed(2)),
          propensaoCompra: Number(compra.toFixed(2)),
          classificacao: this.classificar(risco),
          recomendacao: this.recomendar(risco, compra),
        };
      })
      .sort((a, b) => b.riscoChurn - a.riscoChurn);

    return {
      modelo: 'Regra simples de apoio. Instale Python e scikit-learn para usar Random Forest.',
      tratamentoDados: 'Fallback sem treinamento. O módulo Python possui remoção de duplicados, outliers e normalização Min-Max.',
      acuraciaChurn: null,
      acuraciaCompra: null,
      clientes,
    };
  }

  private calcularDias(data: Date) {
    const diferenca = Date.now() - new Date(data).getTime();
    return Math.max(1, Math.floor(diferenca / 86400000));
  }

  private classificar(risco: number) {
    if (risco >= 70) {
      return 'Alto risco';
    }

    if (risco >= 40) {
      return 'Risco médio';
    }

    return 'Baixo risco';
  }

  private recomendar(risco: number, compra: number) {
    if (risco >= 70) {
      return 'Entrar em contato e oferecer benefício para evitar cancelamento.';
    }

    if (compra >= 70) {
      return 'Cliente com boa chance de upgrade. Oferecer plano superior.';
    }

    if (risco >= 40) {
      return 'Acompanhar o cliente e verificar satisfação.';
    }

    return 'Manter relacionamento normal com o cliente.';
  }
}
