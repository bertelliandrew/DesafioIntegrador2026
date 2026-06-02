"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiErro, AssinaturaFirewall, Cliente, PlanoFirewall } from "@/lib/api";

const emptyForm = {
  clienteId: "",
  planoId: "",
  quantidadeFirewalls: "1",
  ciclo: "mensal" as "mensal" | "anual",
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBR(data?: string | null) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState<AssinaturaFirewall[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planos, setPlanos] = useState<PlanoFirewall[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [assinaturasData, clientesData, planosData] = await Promise.all([
        api.get<AssinaturaFirewall[]>("/assinaturas"),
        api.get<Cliente[]>("/clientes"),
        api.get<PlanoFirewall[]>("/planos"),
      ]);
      setAssinaturas(assinaturasData);
      setClientes(clientesData);
      setPlanos(planosData);
    } catch {
      mostrarMsg("Não foi possível carregar os dados. Verifique se o backend está rodando.", "erro");
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

  const planoSelecionado = useMemo(
    () => planos.find((plano) => plano.id === Number(form.planoId)),
    [form.planoId, planos]
  );

  const valorPreview = planoSelecionado
    ? planoSelecionado.precoMensal * (Number(form.quantidadeFirewalls) || 0)
    : 0;

  async function salvar() {
    const payload = {
      clienteId: Number(form.clienteId),
      planoId: Number(form.planoId),
      quantidadeFirewalls: Number(form.quantidadeFirewalls),
      ciclo: form.ciclo,
    };

    const resultado: (AssinaturaFirewall & ApiErro) = editandoId
      ? await api.put(`/assinaturas/${editandoId}`, payload)
      : await api.post("/assinaturas", payload);

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg(editandoId ? "Assinatura atualizada com sucesso." : "Assinatura criada com sucesso.", "sucesso");
    limpar();
    carregar();
  }

  function editar(assinatura: AssinaturaFirewall) {
    if (assinatura.status === "cancelada") {
      mostrarMsg("Assinaturas canceladas precisam ser reativadas antes da edição.", "erro");
      return;
    }

    setEditandoId(assinatura.id);
    setForm({
      clienteId: String(assinatura.clienteId),
      planoId: String(assinatura.planoId),
      quantidadeFirewalls: String(assinatura.quantidadeFirewalls),
      ciclo: assinatura.ciclo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function cancelar(id: number) {
    const motivo = prompt("Informe o motivo do cancelamento:");
    if (!motivo) return;

    const resultado = await api.put<AssinaturaFirewall & ApiErro>(`/assinaturas/${id}/cancelar`, {
      motivoCancelamento: motivo,
    });

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg("Assinatura cancelada com sucesso.", "sucesso");
    carregar();
  }

  async function reativar(id: number) {
    const resultado = await api.put<AssinaturaFirewall & ApiErro>(`/assinaturas/${id}/reativar`, {});

    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg("Assinatura reativada com sucesso.", "sucesso");
    carregar();
  }

  async function deletar(id: number) {
    if (!confirm("Deseja remover esta assinatura?")) return;

    const resultado = await api.del<ApiErro>(`/assinaturas/${id}`);
    if (resultado.erro) {
      mostrarMsg(resultado.erro, "erro");
      return;
    }

    mostrarMsg("Assinatura removida com sucesso.", "sucesso");
    carregar();
  }

  function limpar() {
    setEditandoId(null);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assinaturas</h1>
        <p>Registro de contratações, alterações, reativações e cancelamentos dos planos de firewall.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">{editandoId ? "Editar assinatura" : "Nova assinatura"}</h2>

        {msg && <div className={`msg msg-${msg.tipo}`}>{msg.texto}</div>}

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Cliente</label>
            <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}>
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 2 }}>
            <label>Plano</label>
            <select value={form.planoId} onChange={(e) => setForm({ ...form, planoId: e.target.value })}>
              <option value="">Selecione um plano</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - {moeda(plano.precoMensal)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantidade de firewalls</label>
            <input type="number" min="1" value={form.quantidadeFirewalls} onChange={(e) => setForm({ ...form, quantidadeFirewalls: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Ciclo</label>
            <select value={form.ciclo} onChange={(e) => setForm({ ...form, ciclo: e.target.value as "mensal" | "anual" })}>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div className="form-group">
            <label>Valor mensal estimado</label>
            <input value={moeda(valorPreview)} disabled />
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={salvar}>Salvar</button>
          {editandoId && <button className="btn btn-secondary" onClick={limpar}>Cancelar edição</button>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Contratações registradas</h2>

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : assinaturas.length === 0 ? (
          <div className="empty-state">Nenhuma assinatura registrada.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Plano</th>
                  <th>Qtd.</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Datas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {assinaturas.map((assinatura) => (
                  <tr key={assinatura.id}>
                    <td><span className="badge">#{assinatura.id}</span></td>
                    <td style={{ fontWeight: 800 }}>{assinatura.nomeCliente}</td>
                    <td>
                      <strong>{assinatura.nomePlano}</strong>
                      <div className="muted">Ciclo {assinatura.ciclo}</div>
                    </td>
                    <td>{assinatura.quantidadeFirewalls}</td>
                    <td className="price">{moeda(assinatura.valorMensal)}</td>
                    <td>
                      <span className={`status ${assinatura.status === "ativa" ? "status-active" : "status-canceled"}`}>
                        {assinatura.status === "ativa" ? "Ativa" : "Cancelada"}
                      </span>
                      {assinatura.motivoCancelamento && (
                        <div className="muted" style={{ marginTop: 6 }}>{assinatura.motivoCancelamento}</div>
                      )}
                    </td>
                    <td className="muted">
                      <div>Início: {dataBR(assinatura.criadoEm)}</div>
                      <div>Cancelamento: {dataBR(assinatura.canceladoEm)}</div>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => editar(assinatura)}>Editar</button>
                        {assinatura.status === "ativa" ? (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelar(assinatura.id)}>Cancelar</button>
                        ) : (
                          <button className="btn btn-success btn-sm" onClick={() => reativar(assinatura.id)}>Reativar</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(assinatura.id)}>Excluir</button>
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
