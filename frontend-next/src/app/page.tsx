import Link from "next/link";
import styles from "./page.module.css";

const cards = [
  { href: "/clientes", icon: "👤", title: "Clientes", desc: "Cadastre e gerencie clientes" },
  { href: "/produtos", icon: "📦", title: "Produtos", desc: "Gerencie estoque e preços" },
  { href: "/pedidos", icon: "🛒", title: "Pedidos", desc: "Registre e acompanhe pedidos" },
];

export default function Home() {
  return (
    <div>
      <div className="page-header">
        <h1>Bem-vindo ao sistema</h1>
        <p>Use o menu acima ou os atalhos abaixo para navegar entre os módulos.</p>
      </div>

      <div className={styles.grid}>
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={styles.card}>
            <span className={styles.icon}>{c.icon}</span>
            <strong className={styles.title}>{c.title}</strong>
            <span className={styles.desc}>{c.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
