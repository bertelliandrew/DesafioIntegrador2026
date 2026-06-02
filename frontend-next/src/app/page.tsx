"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, RelatorioAssinaturas } from "@/lib/api";

const cards = [
  {
    href: "/clientes",
    title: "Clientes",
    desc: "Cadastro com validação de e-mail, cidade, estado e país.",
  },
  {
    href: "/planos",
    title: "Planos de firewall",
    desc: "Três tipos de plano prontos para contratação e manutenção.",
  },
  {
    href: "/assinaturas",
    title: "Assinaturas",
    desc: "Contratações, reativações e cancelamentos de firewall.",
  },
  {
    href: "/relatorios",
    title: "Relatórios",
    desc: "Indicadores de receita, planos e taxa de cancelamento.",
  },
];

const vazio: RelatorioAssinaturas["resumo"] = {
  totalClientes: 0,
  totalPlanos: 0,
  totalAssinaturas: 0,
  assinaturasAtivas: 0,
  assinaturasCanceladas: 0,
  taxaCancelamento: 0,
  receitaMensalAtiva: 0,
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Home() {
  const [resumo, setResumo] = useState(vazio);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const relatorio = await api.get<RelatorioAssinaturas>("/relatorios");
        setResumo(relatorio.resumo);
      } catch {
        setResumo(vazio);
      }
    }

    carregarResumo();
  }, []);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <h1>Gestão simples de assinaturas de firewall</h1>
        <p>
          Sistema web para cadastrar clientes, manter três planos de firewall,
          registrar contratações e acompanhar cancelamentos sem banco de dados por enquanto.
        </p>
        <div className="hero-actions">
          <Link href="/assinaturas" className="hero-link">Criar assinatura</Link>
          <Link href="/relatorios" className="hero-link hero-link-secondary">Ver indicadores</Link>
        </div>
      </section>

      <section className="grid grid-4">
        <div className="metric-card">
          <span className="metric-label">Clientes</span>
          <strong className="metric-value">{resumo.totalClientes}</strong>
          <span className="metric-help">contas cadastradas</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Assinaturas ativas</span>
          <strong className="metric-value">{resumo.assinaturasAtivas}</strong>
          <span className="metric-help">contratos em andamento</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Cancelamento</span>
          <strong className="metric-value">{resumo.taxaCancelamento}%</strong>
          <span className="metric-help">taxa calculada sobre o total</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Receita mensal</span>
          <strong className="metric-value" style={{ fontSize: "1.5rem" }}>{moeda(resumo.receitaMensalAtiva)}</strong>
          <span className="metric-help">assinaturas ativas</span>
        </div>
      </section>

      <section className="grid grid-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="feature-card">
            <strong>{card.title}</strong>
            <span>{card.desc}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
