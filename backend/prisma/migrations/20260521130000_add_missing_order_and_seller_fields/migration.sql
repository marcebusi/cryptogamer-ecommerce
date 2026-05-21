-- Add shipping, payment, and tracking fields to orders
-- These were in the Prisma schema but never had a migration file

ALTER TABLE "orders" ADD COLUMN "shippingCarrier"    TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingService"    TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingCost"       REAL;
ALTER TABLE "orders" ADD COLUMN "shippingPostalCode" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingAddress"    TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingCity"       TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingProvince"   TEXT;
ALTER TABLE "orders" ADD COLUMN "customerName"       TEXT;
ALTER TABLE "orders" ADD COLUMN "customerEmail"      TEXT;
ALTER TABLE "orders" ADD COLUMN "customerPhone"      TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentMethod"      TEXT;
ALTER TABLE "orders" ADD COLUMN "comprovanteUrl"     TEXT;
ALTER TABLE "orders" ADD COLUMN "trackingCode"       TEXT;

-- Add cryptoAlias to sellers (also missing from migration)
ALTER TABLE "sellers" ADD COLUMN "cryptoAlias" TEXT NOT NULL DEFAULT '';
