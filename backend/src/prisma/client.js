require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");

const globalForPrisma = globalThis;

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida no .env");

  const libsql = createClient({ url });
  const adapter = new PrismaLibSql(libsql);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
}

const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
