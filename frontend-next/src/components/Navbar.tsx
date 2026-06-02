"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Início" },
  { href: "/clientes", label: "Clientes" },
  { href: "/planos", label: "Planos" },
  { href: "/assinaturas", label: "Assinaturas" },
  { href: "/relatorios", label: "Relatórios" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandMark}>FS</span>
        <span>FirewallSign</span>
      </Link>

      <div className={styles.links}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
