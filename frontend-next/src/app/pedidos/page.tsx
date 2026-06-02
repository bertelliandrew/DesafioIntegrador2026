"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Cliente, Produto, Pedido } from "@/lib/api";

interface ItemForm {
  produtoId: string;
  quantidade: string;
}

const emptyItem: ItemForm = { produtoId: "", quantidade: "1" };

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [categoria, setCategoria] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [p, c, pr] = await Promise.all([
      api.get<Pedido[]>("/pedidos"),
      api.get<Cliente[]>("/clientes"),
      api.get<Produto[]>("/produtos"),
    ]);
    setPedidos(p);
    setClientes(c);
    setProdutos(pr);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMsg(texto: string, tipo: "erro" | "sucesso") {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3500);
  }

  function addItem() {
    setItens([...itens, { ...emptyItem }]);
  }

  function removeItem(i: number) {
    setItens(itens.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof ItemForm, value: string) {
    const updated = [...itens];
    updated[i] = { ...updated[i], [field]: value };
    setItens(updated);
  }

  async function salvar() {
    const payload = {
      clienteId: parseInt(clienteId),
      produtos: itens.map((it) => ({
        produtoId: parseInt(it.produtoId),
        quantidade: parseInt(it.quantidade),
      })),
      categoria: categoria || undefined,
    };

    const resultado = await api.post<Pedido & { erro?: string }>("/pedidos", payload);
    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }
    mostrarMsg("Pedido criado com sucesso!", "sucesso");
    setClienteId("");
    setCategoria("");
    setItens([{ ...emptyItem }]);
    carregar();
  }

  async function deletar(id: number) {
    if (!confirm("Tem certeza que quer excluir este pedido?")) return;
    await api.del(`/pedidos/${id}`);
    carregar();
  }

  // Preview total
  const totalPreview = itens.reduce((acc, it) => {
    const p = produtos.find((pr) => pr.id === parseInt(it.produtoId));
    if (!p || !it.quantidade) return acc;
    return acc + p.preco * parseInt(it.quantidade);
  }, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Pedidos</h1>
        <p>Registre e acompanhe os pedidos dos clientes.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 18 }}>➕ Novo Pedido</h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecione um cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Produtos
            </label>
            <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Adicionar produto</button>
          </div>

          {itens.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
              <div style={{ flex: 3 }}>
                <select
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 6, fontSize: "0.95rem", fontFamily: "DM Sans, sans-serif" }}
                  value={it.produtoId}
                  onChange={(e) => updateItem(i, "produtoId", e.target.value)}
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {p.preco.toFixed(2)} (estoque: {p.estoque})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 6, fontSize: "0.95rem", fontFamily: "DM Mono, monospace" }}
                  value={it.quantidade}
                  onChange={(e) => updateItem(i, "quantidade", e.target.value)}
                  placeholder="Qtd"
                />
              </div>
              {itens.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "1.2rem", padding: "0 4px" }}
                  title="Remover"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {totalPreview > 0 && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0f4ff", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.88rem", color: "#64748b" }}>Total estimado:</span>
              <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, color: "#1a73e8", fontSize: "1.05rem" }}>
                R$ {totalPreview.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={salvar}>Criar Pedido</button>
      </div>

      {/* Table */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Lista de Pedidos</h2>
        {loading ? (
          <p style={{ color: "#64748b" }}>Carregando...</p>
        ) : pedidos.length === 0 ? (
          <div className="empty-state"><span>🛒</span>Nenhum pedido registrado.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Produtos</th>
                  <th>Total</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td><span className="badge">#{p.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.nomeCliente}</td>
                    <td>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {p.produtos.map((it, i) => (
                          <span key={i}>
                            {it.nomeProduto} ×{it.quantidade}
                            {i < p.produtos.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="price" style={{ color: "#1a73e8", fontWeight: 700 }}>
                      R$ {p.total.toFixed(2)}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => deletar(p.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
