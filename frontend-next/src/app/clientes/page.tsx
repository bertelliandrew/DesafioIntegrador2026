"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Cliente } from "@/lib/api";

const emptyForm = { nome: "", email: "", cidade: "", estado: "", pais: "" };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Cliente[]>("/clientes");
    setClientes(data);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMsg(texto: string, tipo: "erro" | "sucesso") {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3500);
  }

  async function salvar() {
    let resultado: Cliente & { erro?: string };
    if (editandoId) {
      resultado = await api.put(`/clientes/${editandoId}`, form);
    } else {
      resultado = await api.post("/clientes", form);
    }
    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }
    mostrarMsg(editandoId ? "Cliente atualizado!" : "Cliente cadastrado!", "sucesso");
    limpar();
    carregar();
  }

  function editar(c: Cliente) {
    setEditandoId(c.id);
    setForm({ nome: c.nome, email: c.email, cidade: c.cidade, estado: c.estado, pais: c.pais });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletar(id: number) {
    if (!confirm("Tem certeza que quer excluir este cliente?")) return;
    await api.del(`/clientes/${id}`);
    carregar();
  }

  function limpar() {
    setEditandoId(null);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Cadastre e gerencie os clientes do sistema.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 18 }}>
          {editandoId ? "✏️ Editar Cliente" : "➕ Novo Cliente"}
        </h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cidade</label>
            <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
          </div>
          <div className="form-group" style={{ maxWidth: 100 }}>
            <label>Estado</label>
            <input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} />
          </div>
          <div className="form-group">
            <label>País</label>
            <input value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} placeholder="Brasil" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn btn-primary" onClick={salvar}>Salvar</button>
          {editandoId && <button className="btn btn-secondary" onClick={limpar}>Cancelar</button>}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Lista de Clientes</h2>
        {loading ? (
          <p style={{ color: "#64748b" }}>Carregando...</p>
        ) : clientes.length === 0 ? (
          <div className="empty-state"><span>👤</span>Nenhum cliente cadastrado.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>País</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td><span className="badge">#{c.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ color: "#64748b" }}>{c.email}</td>
                    <td>{c.cidade}</td>
                    <td>{c.estado}</td>
                    <td>{c.pais}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary btn-sm" onClick={() => editar(c)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(c.id)}>Excluir</button>
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
