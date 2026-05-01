CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "sellerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "analytics_events_type_createdAt_idx" ON "analytics_events"("type", "createdAt");
