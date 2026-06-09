"use client";

import { useCallback, useEffect, useState } from "react";
import { api, RelatorioIa } from "@/lib/api";

const vazio: RelatorioIa = {
  modelo: "Random Forest",
  tratamentoDados: "",
  acuraciaChurn: null,
  acuraciaCompra: null,
  clientes: [],
};

function percentual(valor: number | null) {
  if (valor === null || valor === undefined) {
    return "-";
  }

  return `${valor}%`;
}

function riscoTexto(cliente: RelatorioIa["clientes"][number]) {
  if (cliente.statusAnalise === "Churn confirmado") {
    return "Churn confirmado";
  }

  return `${cliente.riscoChurn}%`;
}

export default function IaPage() {
  const [relatorio, setRelatorio] = useState<RelatorioIa>(vazio);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      const data = await api.get<RelatorioIa>("/ia/clientes");
      setRelatorio(data?.clientes ? data : vazio);
    } catch {
      setErro("Não foi possível carregar a análise estratégica. Verifique se o backend está rodando.");
      setRelatorio(vazio);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const clientesCancelados = relatorio.clientes.filter(
    (cliente) => cliente.statusAnalise === "Churn confirmado",
  ).length;

  const clientesEmAtencao = relatorio.clientes.filter(
    (cliente) => cliente.statusAnalise !== "Churn confirmado" && cliente.riscoChurn >= 70,
  ).length;

  const melhorOportunidade = [...relatorio.clientes].filter(
    (cliente) => cliente.statusAnalise !== "Churn confirmado",
  ).sort((a, b) => b.propensaoCompra - a.propensaoCompra)[0];

  return (
    <div>
      <div className="page-header">
        <h1>Crescimento estratégico</h1>
        <p>
          Análise simples para identificar clientes cancelados, clientes em risco
          e oportunidades de crescimento ou upgrade.
        </p>
      </div>

      {erro && <div className="msg msg-erro">{erro}</div>}

      {loading ? (
        <div className="card"><p className="muted">Carregando...</p></div>
      ) : (
        <div className="grid" style={{ gap: 24 }}>
          <section className="grid grid-4">
            <div className="metric-card">
              <span className="metric-label">Clientes analisados</span>
              <strong className="metric-value">{relatorio.clientes.length}</strong>
              <span className="metric-help">base cadastrada no sistema</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Clientes em atenção</span>
              <strong className="metric-value">{clientesEmAtencao}</strong>
              <span className="metric-help">ativos com risco acima de 70%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Reativação</span>
              <strong className="metric-value">{clientesCancelados}</strong>
              <span className="metric-help">clientes com churn confirmado</span>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Melhor oportunidade comercial</h2>
            <p className="muted">
              {melhorOportunidade
                ? `${melhorOportunidade.nome} possui potencial de crescimento ${melhorOportunidade.potencialCrescimento.toLowerCase()} e propensão de compra de ${melhorOportunidade.propensaoCompra}%.`
                : "Sem clientes ativos suficientes para análise de upgrade."}
            </p>
          </section>

          <section className="card">
            <h2 className="card-title">Ranking estratégico de clientes</h2>
            {relatorio.clientes.length === 0 ? (
              <div className="empty-state">Nenhum cliente para analisar.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Situação estratégica</th>
                      <th>Análise de churn</th>
                      <th>Potencial de crescimento</th>
                      <th>Ação recomendada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.clientes.map((cliente) => (
                      <tr key={cliente.clienteId}>
                        <td>
                          <strong>{cliente.nome}</strong>
                          <div className="muted" style={{ fontSize: "0.78rem" }}>{cliente.email}</div>
                        </td>
                        <td>{cliente.estado}</td>
                        <td>{cliente.situacaoEstrategica}</td>
                        <td>
                          <span className={cliente.statusAnalise === "Churn confirmado" || cliente.riscoChurn >= 70 ? "status-canceled" : "status-active"}>
                            {cliente.statusAnalise}
                          </span>
                          <div className="muted" style={{ fontSize: "0.78rem", marginTop: 4 }}>
                            {riscoTexto(cliente)}
                          </div>
                        </td>
                        <td>
                          <strong>{cliente.potencialCrescimento}</strong>
                          <div className="muted" style={{ fontSize: "0.78rem" }}>
                            Propensão: {cliente.propensaoCompra}%
                          </div>
                        </td>
                        <td>{cliente.recomendacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
