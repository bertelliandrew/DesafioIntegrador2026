const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Types
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  pais: string;
  criadoEm?: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria?: string;
  criadoEm?: string;
}

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  nomeCliente: string;
  produtos: ItemPedido[];
  categoria?: string;
  total: number;
  criadoEm?: string;
}
