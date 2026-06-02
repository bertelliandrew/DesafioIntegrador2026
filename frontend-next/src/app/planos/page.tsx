"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiErro, PlanoFirewall } from "@/lib/api";

const emptyForm = {
  nome: "",
  descricao: "",
  precoMensal: "",
  limiteDispositivos: "",
  suporte: "",
  recursos: "",
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<PlanoFirewall[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PlanoFirewall[]>("/planos");
      setPlanos(data);
    } catch {
      mostrarMsg("Não foi possível carregar os planos. Verifique se o backend está rodando.", "erro");
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
      nome: form.nome,
      descricao: form.descricao,
      precoMensal: Number(form.precoMensal),
      limiteDispositivos: Number(form.limiteDispositivos),
      suporte: form.suporte,
      recursos: form.recursos,
    };

    const resultado: (PlanoFirewall & ApiErro) = editandoId
      ? await api.put(`/planos/${editandoId}`, payload)
      : await api.post("/planos", payload);

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg(editandoId ? "Plano atualizado com sucesso." : "Plano cadastrado com sucesso.", "sucesso");
    limpar();
    carregar();
  }

  function editar(plano: PlanoFirewall) {
    setEditandoId(plano.id);
    setForm({
      nome: plano.nome,
      descricao: plano.descricao,
      precoMensal: String(plano.precoMensal),
      limiteDispositivos: String(plano.limiteDispositivos),
      suporte: plano.suporte,
      recursos: plano.recursos.join("; "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletar(id: number) {
    if (!confirm("Deseja remover este plano?")) return;

    const resultado = await api.del<ApiErro>(`/planos/${id}`);
    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg("Plano removido com sucesso.", "sucesso");
    carregar();
  }

  function limpar() {
    setEditandoId(null);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Planos de firewall</h1>
        <p>Manutenção dos três tipos de planos usados nas contratações de firewall.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">{editandoId ? "Editar plano" : "Novo plano"}</h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Nome do plano</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Firewall Profissional" />
          </div>
          <div className="form-group">
            <label>Preço mensal</label>
            <input type="number" min="0" step="0.01" value={form.precoMensal} onChange={(e) => setForm({ ...form, precoMensal: e.target.value })} placeholder="349.90" />
          </div>
          <div className="form-group">
            <label>Limite</label>
            <input type="number" min="1" value={form.limiteDispositivos} onChange={(e) => setForm({ ...form, limiteDispositivos: e.target.value })} placeholder="50" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Suporte</label>
            <input value={form.suporte} onChange={(e) => setForm({ ...form, suporte: e.target.value })} placeholder="Prioritário" />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Recursos</label>
            <input value={form.recursos} onChange={(e) => setForm({ ...form, recursos: e.target.value })} placeholder="VPN; Alertas; Relatórios" />
          </div>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Resumo do plano e do público indicado" />
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={salvar}>Salvar</button>
          {editandoId && <button className="btn btn-secondary" onClick={limpar}>Cancelar edição</button>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Planos disponíveis</h2>

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : planos.length === 0 ? (
          <div className="empty-state">Nenhum plano cadastrado.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plano</th>
                  <th>Preço</th>
                  <th>Limite</th>
                  <th>Suporte</th>
                  <th>Recursos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {planos.map((plano) => (
                  <tr key={plano.id}>
                    <td><span className="badge">#{plano.id}</span></td>
                    <td>
                      <strong>{plano.nome}</strong>
                      <div className="muted" style={{ maxWidth: 360 }}>{plano.descricao}</div>
                    </td>
                    <td className="price">{moeda(plano.precoMensal)}</td>
                    <td>{plano.limiteDispositivos} firewalls</td>
                    <td>{plano.suporte}</td>
                    <td className="muted">{plano.recursos.join(", ") || "Não informado"}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => editar(plano)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(plano.id)}>Excluir</button>
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
