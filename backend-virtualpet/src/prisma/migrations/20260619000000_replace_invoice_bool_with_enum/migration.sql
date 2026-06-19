-- CreateEnum
CREATE TYPE "order"."InvoiceStatus" AS ENUM ('NONE', 'REQUIRED', 'DONE');

-- AlterTable: add new enum column with default
ALTER TABLE "order"."order" ADD COLUMN "invoice_status" "order"."InvoiceStatus" NOT NULL DEFAULT 'NONE';

-- Migrate existing data: requires_invoice = true → REQUIRED
UPDATE "order"."order" SET "invoice_status" = 'REQUIRED' WHERE "requires_invoice" = true;

-- Drop old boolean column
ALTER TABLE "order"."order" DROP COLUMN "requires_invoice";
