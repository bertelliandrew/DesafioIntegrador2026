"use client";

import { useCallback, useEffect, useState } from "react";
import { api, RelatorioAssinaturas } from "@/lib/api";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const relatorioVazio: RelatorioAssinaturas = {
  resumo: {
    totalClientes: 0,
    totalPlanos: 0,
    totalAssinaturas: 0,
    assinaturasAtivas: 0,
    assinaturasCanceladas: 0,
    taxaCancelamento: 0,
    receitaMensalAtiva: 0,
  },
  assinaturasPorPlano: [],
  planoMaisContratado: null,
  cancelamentosPorMotivo: {},
  clientesPorEstado: {},
};

export default function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<RelatorioAssinaturas>(relatorioVazio);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await api.get<RelatorioAssinaturas>("/relatorios");
      setRelatorio(data);
    } catch {
      setErro("Não foi possível carregar os relatórios. Verifique se o backend está rodando.");
      setRelatorio(relatorioVazio);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const resumo = relatorio.resumo;
  const motivos = Object.entries(relatorio.cancelamentosPorMotivo);
  const estados = Object.entries(relatorio.clientesPorEstado);

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>
          Indicadores gerenciais de assinaturas de firewall. A análise preditiva fica disponível
          na tela de crescimento estratégico.
        </p>
      </div>

      {erro && <div className="msg msg-erro">{erro}</div>}

      {loading ? (
        <div className="card"><p className="muted">Carregando...</p></div>
      ) : (
        <div className="grid" style={{ gap: 24 }}>
          <section className="grid grid-4">
            <div className="metric-card">
              <span className="metric-label">Receita mensal ativa</span>
              <strong className="metric-value" style={{ fontSize: "1.55rem" }}>{moeda(resumo.receitaMensalAtiva)}</strong>
              <span className="metric-help">somente assinaturas ativas</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Taxa de cancelamento</span>
              <strong className="metric-value">{resumo.taxaCancelamento}%</strong>
              <span className="metric-help">canceladas / total</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Assinaturas ativas</span>
              <strong className="metric-value">{resumo.assinaturasAtivas}</strong>
              <span className="metric-help">contratos vigentes</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Assinaturas canceladas</span>
              <strong className="metric-value">{resumo.assinaturasCanceladas}</strong>
              <span className="metric-help">base para taxa de cancelamento</span>
            </div>
          </section>

          <section className="grid grid-2">
            <div className="card">
              <h2 className="card-title">Resumo geral</h2>
              <div className="grid">
                <div>
                  <span className="metric-label">Clientes</span>
                  <strong className="metric-value">{resumo.totalClientes}</strong>
                </div>
                <div>
                  <span className="metric-label">Planos cadastrados</span>
                  <strong className="metric-value">{resumo.totalPlanos}</strong>
                </div>
                <div>
                  <span className="metric-label">Plano mais contratado</span>
                  <strong style={{ display: "block", marginTop: 8 }}>
                    {relatorio.planoMaisContratado?.nomePlano || "Sem dados"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Clientes por estado</h2>
              {estados.length === 0 ? (
                <div className="empty-state">Nenhum cliente cadastrado.</div>
              ) : (
                <div className="grid">
                  {estados.map(([estado, total]) => (
                    <div key={estado}>
                      <div className="actions" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                        <strong>{estado}</strong>
                        <span className="muted">{total}</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${Math.min(100, (total / Math.max(1, resumo.totalClientes)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Assinaturas por plano</h2>
            {relatorio.assinaturasPorPlano.length === 0 ? (
              <div className="empty-state">Nenhum plano para exibir.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Plano</th>
                      <th>Total</th>
                      <th>Ativas</th>
                      <th>Canceladas</th>
                      <th>Receita ativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.assinaturasPorPlano.map((plano) => (
                      <tr key={plano.planoId}>
                        <td style={{ fontWeight: 800 }}>{plano.nomePlano}</td>
                        <td>{plano.total}</td>
                        <td>{plano.ativas}</td>
                        <td>{plano.canceladas}</td>
                        <td className="price">{moeda(plano.receitaMensalAtiva)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Motivos de cancelamento</h2>
            {motivos.length === 0 ? (
              <div className="empty-state">Nenhum cancelamento registrado.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Motivo</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motivos.map(([motivo, total]) => (
                      <tr key={motivo}>
                        <td>{motivo}</td>
                        <td>{total}</td>
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
