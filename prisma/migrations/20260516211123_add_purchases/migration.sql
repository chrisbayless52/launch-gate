-- CreateTable (PostgreSQL)
CREATE TABLE "Purchase" (
    "id"       SERIAL       NOT NULL,
    "shop"     TEXT         NOT NULL,
    "chargeId" TEXT         NOT NULL,
    "paidAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_chargeId_key" ON "Purchase"("chargeId");

-- CreateIndex
CREATE INDEX "Purchase_shop_idx" ON "Purchase"("shop");
