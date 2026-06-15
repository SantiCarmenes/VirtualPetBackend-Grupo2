-- AlterTable: add invoice fields to order
ALTER TABLE "order"."order" ADD COLUMN "requires_invoice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "order"."order" ADD COLUMN "invoice_cuit" TEXT;
