import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sistema de Análise Empresarial",
  description: "Gerencie clientes, produtos e pedidos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="container" style={{ marginTop: 40, marginBottom: 60 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
