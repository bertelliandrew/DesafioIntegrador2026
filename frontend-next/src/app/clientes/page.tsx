"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiErro, Cliente } from "@/lib/api";

const emptyForm = { nome: "", email: "", cidade: "", estado: "", pais: "Brasil" };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Cliente[]>("/clientes");
      setClientes(data);
    } catch {
      mostrarMsg("Não foi possível carregar os clientes. Verifique se o backend está rodando.", "erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function mostrarMsg(texto: string, tipo: "erro" | "sucesso") {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3500);
  }

  async function salvar() {
    const payload = {
      ...form,
      estado: form.estado.toUpperCase(),
    };

    const resultado: (Cliente & ApiErro) = editandoId
      ? await api.put(`/clientes/${editandoId}`, payload)
      : await api.post("/clientes", payload);

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg(editandoId ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.", "sucesso");
    limpar();
    carregar();
  }

  function editar(cliente: Cliente) {
    setEditandoId(cliente.id);
    setForm({
      nome: cliente.nome,
      email: cliente.email,
      cidade: cliente.cidade,
      estado: cliente.estado,
      pais: cliente.pais,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletar(id: number) {
    if (!confirm("Deseja remover este cliente?")) return;

    const resultado = await api.del<ApiErro>(`/clientes/${id}`);
    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg("Cliente removido com sucesso.", "sucesso");
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
        <p>Cadastro das empresas que podem contratar planos de firewall.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">{editandoId ? "Editar cliente" : "Novo cliente"}</h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da empresa" />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cidade</label>
            <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
          </div>
          <div className="form-group" style={{ maxWidth: 120 }}>
            <label>Estado</label>
            <input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="PR" maxLength={2} />
          </div>
          <div className="form-group">
            <label>País</label>
            <input value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} placeholder="Brasil" />
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={salvar}>Salvar</button>
          {editandoId && <button className="btn btn-secondary" onClick={limpar}>Cancelar edição</button>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Lista de clientes</h2>

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : clientes.length === 0 ? (
          <div className="empty-state">Nenhum cliente cadastrado.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>País</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td><span className="badge">#{cliente.id}</span></td>
                    <td style={{ fontWeight: 800 }}>{cliente.nome}</td>
                    <td className="muted">{cliente.email}</td>
                    <td>{cliente.cidade}</td>
                    <td>{cliente.estado}</td>
                    <td>{cliente.pais}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => editar(cliente)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(cliente.id)}>Excluir</button>
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
