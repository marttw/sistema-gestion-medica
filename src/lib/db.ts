import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined. Copy .env.example to .env and set it.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
    // Fail fast instead of hanging when the database is unreachable.
    connectionTimeoutMillis: 5_000,
  });

  return new PrismaClient({ adapter });
}

// In development, Next.js hot reload re-evaluates modules. Caching the client
// on globalThis prevents opening a new connection pool on every reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
