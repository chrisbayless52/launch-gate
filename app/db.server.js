import { PrismaClient } from "@prisma/client";

// Reuse the client across hot-reloads in development so we don't exhaust
// the connection pool. In production (Cloud Run) each instance is isolated,
// but the globalThis guard still prevents duplicate clients within a request.
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;
