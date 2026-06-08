const express = require("express");
const cors = require("cors");

const clienteRoutes = require("./routes/clienteRoutes");
const planoRoutes = require("./routes/planoRoutes");
const assinaturaRoutes = require("./routes/assinaturaRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/clientes", clienteRoutes);
app.use("/api/planos", planoRoutes);
app.use("/api/assinaturas", assinaturaRoutes);
app.use("/api/relatorios", relatorioRoutes);

app.get("/", (req, res) => {
  res.json({
    mensagem: "API FirewallSign rodando com sucesso.",
    tema: "Assinaturas de planos de firewall",
    endpoints: ["/api/clientes", "/api/planos", "/api/assinaturas", "/api/relatorios"],
  });
});

// Graceful shutdown — necessário no Prisma 7 para fechar conexões corretamente
const prisma = require("./prisma/client");

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
