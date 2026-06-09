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
  cliente_cancelado: number;
};

type ClienteAnalise = {
  clienteId: number;
  nome: string;
  email: string;
  estado: string;
  riscoChurn: number;
  propensaoCompra: number;
  classificacao: string;
  recomendacao: string;
  situacaoEstrategica: string;
  statusAnalise: string;
  potencialCrescimento: string;
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
      return {
        ...resultadoPython,
        clientes: this.ordenarClientes(
          resultadoPython.clientes.map((cliente: ClienteAnalise) => this.ajustarSituacao(cliente, entrada)),
        ),
      };
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
      cliente_cancelado: ativas.length === 0 && canceladas.length > 0 ? 1 : 0,
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
    const clientes = this.ordenarClientes(
      entrada.map((cliente) => {
        const clienteCancelado = cliente.cliente_cancelado === 1;

        const risco = clienteCancelado
          ? 100
          : Math.min(
              95,
              cliente.assinaturas_canceladas * 35 +
                (cliente.total_assinaturas === 0 ? 15 : 0) +
                (cliente.assinaturas_ativas === 0 && cliente.total_assinaturas > 0 ? 30 : 0),
            );

        const compra = clienteCancelado
          ? 25
          : Math.min(
              95,
              cliente.assinaturas_ativas * 25 +
                cliente.usa_ciclo_anual * 15 +
                (cliente.valor_mensal_total > 500 ? 25 : 10),
            );

        return this.ajustarSituacao(
          {
            clienteId: cliente.clienteId,
            nome: cliente.nome,
            email: cliente.email,
            estado: cliente.estado,
            riscoChurn: Number(risco.toFixed(2)),
            propensaoCompra: Number(compra.toFixed(2)),
            classificacao: this.classificar(risco),
            recomendacao: this.recomendar(risco, compra),
            situacaoEstrategica: '',
            statusAnalise: '',
            potencialCrescimento: '',
          },
          entrada,
        );
      }),
    );

    return {
      modelo: 'Regra simples de apoio. Instale Python e scikit-learn para usar Random Forest.',
      tratamentoDados: 'Fallback sem treinamento. O módulo Python possui remoção de duplicados, outliers e normalização Min-Max.',
      acuraciaChurn: null,
      acuraciaCompra: null,
      clientes,
    };
  }

  private ajustarSituacao(cliente: ClienteAnalise, entrada: EntradaIa[]) {
    const dados = entrada.find((item) => item.clienteId === cliente.clienteId);
    const cancelado = dados?.cliente_cancelado === 1;
    const ativoComHistorico = Number(dados?.assinaturas_ativas || 0) > 0 && Number(dados?.assinaturas_canceladas || 0) > 0;

    if (cancelado) {
      return {
        ...cliente,
        riscoChurn: 100,
        propensaoCompra: Math.min(cliente.propensaoCompra, 35),
        classificacao: 'Churn confirmado',
        situacaoEstrategica: 'Cliente cancelado',
        statusAnalise: 'Churn confirmado',
        potencialCrescimento: 'Reativação',
        recomendacao: 'Entrar em contato para tentar reativação com condição especial.',
      };
    }

    if (ativoComHistorico) {
      return {
        ...cliente,
        classificacao: cliente.riscoChurn >= 70 ? 'Alto risco' : 'Risco médio',
        situacaoEstrategica: 'Cliente ativo em atenção',
        statusAnalise: cliente.riscoChurn >= 70 ? 'Alto risco de churn' : 'Histórico de cancelamento',
        potencialCrescimento: this.definirPotencial(cliente.propensaoCompra),
        recomendacao: 'Realizar contato preventivo e acompanhar satisfação do cliente.',
      };
    }

    if (cliente.propensaoCompra >= 70 && cliente.riscoChurn < 60) {
      return {
        ...cliente,
        classificacao: 'Oportunidade de crescimento',
        situacaoEstrategica: 'Oportunidade de crescimento',
        statusAnalise: 'Baixo risco de churn',
        potencialCrescimento: 'Alto',
        recomendacao: 'Oferecer upgrade de plano ou pacote adicional de firewall.',
      };
    }

    if (cliente.riscoChurn >= 70) {
      return {
        ...cliente,
        classificacao: 'Alto risco',
        situacaoEstrategica: 'Cliente em risco',
        statusAnalise: 'Alto risco de churn',
        potencialCrescimento: this.definirPotencial(cliente.propensaoCompra),
        recomendacao: 'Entrar em contato e oferecer benefício para evitar cancelamento.',
      };
    }

    if (cliente.riscoChurn >= 40) {
      return {
        ...cliente,
        classificacao: 'Risco médio',
        situacaoEstrategica: 'Cliente em acompanhamento',
        statusAnalise: 'Risco médio de churn',
        potencialCrescimento: this.definirPotencial(cliente.propensaoCompra),
        recomendacao: 'Acompanhar o cliente e verificar satisfação.',
      };
    }

    return {
      ...cliente,
      classificacao: 'Cliente estável',
      situacaoEstrategica: 'Cliente estável',
      statusAnalise: 'Baixo risco de churn',
      potencialCrescimento: this.definirPotencial(cliente.propensaoCompra),
      recomendacao: cliente.propensaoCompra >= 50
        ? 'Manter relacionamento e avaliar oferta futura de upgrade.'
        : 'Manter relacionamento normal com o cliente.',
    };
  }

  private ordenarClientes(clientes: ClienteAnalise[]) {
    return clientes.sort((a, b) => {
      const prioridade = (cliente: ClienteAnalise) => {
        if (cliente.statusAnalise === 'Churn confirmado') return 4;
        if (cliente.riscoChurn >= 70) return 3;
        if (cliente.propensaoCompra >= 70) return 2;
        if (cliente.riscoChurn >= 40) return 1;
        return 0;
      };

      return prioridade(b) - prioridade(a) || b.riscoChurn - a.riscoChurn || b.propensaoCompra - a.propensaoCompra;
    });
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

  private definirPotencial(compra: number) {
    if (compra >= 70) {
      return 'Alto';
    }

    if (compra >= 40) {
      return 'Médio';
    }

    return 'Baixo';
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
