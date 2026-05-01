-- CreateTable
CREATE TABLE "store_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionExpiresAt" DATETIME,
    "planName" TEXT NOT NULL DEFAULT 'PRO',
    "notes" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
