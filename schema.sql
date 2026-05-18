-- schema.sql
-- Standalone initialization script for Google Cloud SQL (PostgreSQL 14+).
-- Use this if you need to create the tables manually (e.g. via Cloud Shell
-- or psql) rather than running `prisma migrate deploy`.
--
-- Usage:
--   psql $DATABASE_URL -f schema.sql
--
-- This is equivalent to running all three Prisma migrations in order.

-- Session table (Shopify OAuth session storage via PrismaSessionStorage)
CREATE TABLE IF NOT EXISTS "Session" (
    "id"                  TEXT         NOT NULL,
    "shop"                TEXT         NOT NULL,
    "state"               TEXT         NOT NULL,
    "isOnline"            BOOLEAN      NOT NULL DEFAULT false,
    "scope"               TEXT,
    "expires"             TIMESTAMP(3),
    "accessToken"         TEXT         NOT NULL,
    "userId"              BIGINT,
    "firstName"           TEXT,
    "lastName"            TEXT,
    "email"               TEXT,
    "accountOwner"        BOOLEAN      NOT NULL DEFAULT false,
    "locale"              TEXT,
    "collaborator"        BOOLEAN               DEFAULT false,
    "emailVerified"       BOOLEAN               DEFAULT false,
    "refreshToken"        TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Purchase table (one-time billing records, valid for 30 days)
CREATE TABLE IF NOT EXISTS "Purchase" (
    "id"       SERIAL       NOT NULL,
    "shop"     TEXT         NOT NULL,
    "chargeId" TEXT         NOT NULL,
    "paidAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_chargeId_key" ON "Purchase"("chargeId");
CREATE INDEX        IF NOT EXISTS "Purchase_shop_idx"     ON "Purchase"("shop");

-- Prisma migration tracking table (so `prisma migrate deploy` knows these
-- migrations are already applied if you used this file instead).
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT         NOT NULL,
    "checksum"              TEXT         NOT NULL,
    "finished_at"           TIMESTAMPTZ,
    "migration_name"        TEXT         NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMPTZ,
    "started_at"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "applied_steps_count"   INTEGER      NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
