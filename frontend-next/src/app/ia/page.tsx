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

  const altoRisco = relatorio.clientes.filter((cliente) => cliente.riscoChurn >= 70).length;
  const melhorCompra = [...relatorio.clientes].sort(
    (a, b) => b.propensaoCompra - a.propensaoCompra,
  )[0];

  return (
    <div>
      <div className="page-header">
        <h1>Crescimento estratégico</h1>
        <p>
          Análise simples de clientes para estimar risco de churn e
          oportunidades de compra ou upgrade.
        </p>
      </div>

      {erro && <div className="msg msg-erro">{erro}</div>}

      {loading ? (
        <div className="card"><p className="muted">Carregando...</p></div>
      ) : (
        <div className="grid" style={{ gap: 24 }}>
          <section className="grid grid-4">
            <div className="metric-card">
              <span className="metric-label">Modelo</span>
              <strong className="metric-value" style={{ fontSize: "1.25rem" }}>{relatorio.modelo}</strong>
              <span className="metric-help">análise dos clientes</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Clientes analisados</span>
              <strong className="metric-value">{relatorio.clientes.length}</strong>
              <span className="metric-help">base cadastrada no sistema</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Alto risco</span>
              <strong className="metric-value">{altoRisco}</strong>
              <span className="metric-help">clientes com risco acima de 70%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Maior chance de compra</span>
              <strong className="metric-value" style={{ fontSize: "1.1rem" }}>
                {melhorCompra?.nome || "Sem dados"}
              </strong>
              <span className="metric-help">cliente mais propenso a upgrade</span>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Tratamento dos dados</h2>
            <p className="muted">{relatorio.tratamentoDados || "Sem informações de tratamento."}</p>
            <div className="actions" style={{ marginTop: 14 }}>
              <span className="badge">Precisão churn: {percentual(relatorio.acuraciaChurn)}</span>
              <span className="badge">Precisão compra: {percentual(relatorio.acuraciaCompra)}</span>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Ranking de clientes</h2>
            {relatorio.clientes.length === 0 ? (
              <div className="empty-state">Nenhum cliente para analisar.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Risco de churn</th>
                      <th>Chance de compra</th>
                      <th>Classificação</th>
                      <th>Recomendação</th>
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
                        <td>{cliente.riscoChurn}%</td>
                        <td>{cliente.propensaoCompra}%</td>
                        <td>
                          <span className={cliente.riscoChurn >= 70 ? "status-canceled" : "status-active"}>
                            {cliente.classificacao}
                          </span>
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
