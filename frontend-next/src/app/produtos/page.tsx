"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Produto } from "@/lib/api";

const emptyForm = { nome: "", preco: "", estoque: "", categoria: "" };

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Produto[]>("/produtos");
    setProdutos(data);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMsg(texto: string, tipo: "erro" | "sucesso") {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3500);
  }

  async function salvar() {
    const payload = {
      nome: form.nome,
      preco: parseFloat(form.preco),
      estoque: parseInt(form.estoque),
      categoria: form.categoria || undefined,
    };

    let resultado: Produto & { erro?: string };
    if (editandoId) {
      resultado = await api.put(`/produtos/${editandoId}`, payload);
    } else {
      resultado = await api.post("/produtos", payload);
    }

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }
    mostrarMsg(editandoId ? "Produto atualizado!" : "Produto cadastrado!", "sucesso");
    limpar();
    carregar();
  }

  function editar(p: Produto) {
    setEditandoId(p.id);
    setForm({
      nome: p.nome,
      preco: String(p.preco),
      estoque: String(p.estoque),
      categoria: p.categoria || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletar(id: number) {
    if (!confirm("Tem certeza que quer excluir este produto?")) return;
    await api.del(`/produtos/${id}`);
    carregar();
  }

  function limpar() {
    setEditandoId(null);
    setForm(emptyForm);
  }

  function estoqueColor(estoque: number) {
    if (estoque === 0) return "#e53935";
    if (estoque < 5) return "#f57c00";
    return "#2e7d32";
  }

  return (
    <div>
      <div className="page-header">
        <h1>Produtos</h1>
        <p>Gerencie o catálogo, estoque e preços.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 18 }}>
          {editandoId ? "✏️ Editar Produto" : "➕ Novo Produto"}
        </h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do produto" />
          </div>
          <div className="form-group">
            <label>Preço (R$)</label>
            <input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Estoque</label>
            <input type="number" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Opcional" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn btn-primary" onClick={salvar}>Salvar</button>
          {editandoId && <button className="btn btn-secondary" onClick={limpar}>Cancelar</button>}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Catálogo de Produtos</h2>
        {loading ? (
          <p style={{ color: "#64748b" }}>Carregando...</p>
        ) : produtos.length === 0 ? (
          <div className="empty-state"><span>📦</span>Nenhum produto cadastrado.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td><span className="badge">#{p.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.nome}</td>
                    <td className="price">R$ {p.preco.toFixed(2)}</td>
                    <td>
                      <span style={{
                        fontFamily: "DM Mono, monospace",
                        fontWeight: 600,
                        color: estoqueColor(p.estoque),
                      }}>
                        {p.estoque}
                      </span>
                    </td>
                    <td>
                      {p.categoria ? (
                        <span style={{
                          background: "#f0f4ff",
                          color: "#3730a3",
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}>
                          {p.categoria}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary btn-sm" onClick={() => editar(p)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(p.id)}>Excluir</button>
                      </div>
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
