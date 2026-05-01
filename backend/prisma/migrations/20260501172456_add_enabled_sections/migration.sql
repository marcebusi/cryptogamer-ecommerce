-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_store_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionExpiresAt" DATETIME,
    "planName" TEXT NOT NULL DEFAULT 'PRO',
    "notes" TEXT NOT NULL DEFAULT '',
    "enabledSections" TEXT NOT NULL DEFAULT '["orders","analytics","sellers","contact"]',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_store_config" ("id", "notes", "planName", "subscriptionActive", "subscriptionExpiresAt", "updatedAt") SELECT "id", "notes", "planName", "subscriptionActive", "subscriptionExpiresAt", "updatedAt" FROM "store_config";
DROP TABLE "store_config";
ALTER TABLE "new_store_config" RENAME TO "store_config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
