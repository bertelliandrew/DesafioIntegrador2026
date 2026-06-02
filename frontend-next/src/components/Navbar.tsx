"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Início" },
  { href: "/clientes", label: "Clientes" },
  { href: "/produtos", label: "Produtos" },
  { href: "/pedidos", label: "Pedidos" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span>📊</span> AnaliseEmp
      </div>
      <div className={styles.links}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`${styles.link} ${pathname === l.href ? styles.active : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
