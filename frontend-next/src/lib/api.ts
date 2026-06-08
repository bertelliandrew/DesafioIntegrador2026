const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok && !data?.erro) {
    return { erro: "Erro na comunicação com a API." } as T;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface ApiErro {
  erro?: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  pais: string;
  criadoEm?: string;
}

export interface PlanoFirewall {
  id: number;
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteDispositivos: number;
  suporte: string;
  recursos: string[];
  criadoEm?: string;
}

export type StatusAssinatura = "ativa" | "cancelada";

export interface AssinaturaFirewall {
  id: number;
  clienteId: number;
  nomeCliente: string;
  planoId: number;
  nomePlano: string;
  quantidadeFirewalls: number;
  ciclo: "mensal" | "anual";
  status: StatusAssinatura;
  valorMensal: number;
  motivoCancelamento?: string | null;
  criadoEm?: string;
  canceladoEm?: string | null;
}

export interface RelatorioResumo {
  totalClientes: number;
  totalPlanos: number;
  totalAssinaturas: number;
  assinaturasAtivas: number;
  assinaturasCanceladas: number;
  taxaCancelamento: number;
  receitaMensalAtiva: number;
}

export interface RelatorioPlano {
  planoId: number;
  nomePlano: string;
  total: number;
  ativas: number;
  canceladas: number;
  receitaMensalAtiva: number;
}

export interface RelatorioAssinaturas {
  resumo: RelatorioResumo;
  assinaturasPorPlano: RelatorioPlano[];
  planoMaisContratado: RelatorioPlano | null;
  cancelamentosPorMotivo: Record<string, number>;
  clientesPorEstado: Record<string, number>;
}

export interface ClienteIa {
  clienteId: number;
  nome: string;
  email: string;
  estado: string;
  riscoChurn: number;
  propensaoCompra: number;
  classificacao: string;
  recomendacao: string;
}

export interface RelatorioIa {
  modelo: string;
  tratamentoDados: string;
  acuraciaChurn: number | null;
  acuraciaCompra: number | null;
  clientes: ClienteIa[];
}
