-- AlterTable
ALTER TABLE "store_config" ADD COLUMN "billingAlias" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_config" ADD COLUMN "billingDay" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "store_config" ADD COLUMN "monthlyAmount" REAL NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "service_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "markedByEmail" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
