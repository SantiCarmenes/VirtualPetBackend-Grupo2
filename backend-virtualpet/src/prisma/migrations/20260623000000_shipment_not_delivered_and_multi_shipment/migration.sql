-- Add NOT_DELIVERED value to ShipmentStatus enum (shipping schema)
ALTER TYPE "shipping"."ShipmentStatus" ADD VALUE IF NOT EXISTS 'NOT_DELIVERED';

-- Allow multiple shipments per order (one shipment per delivery attempt):
-- drop the unique constraint on order_id.
DROP INDEX IF EXISTS "shipping"."shipment_order_id_key";

-- Non-unique index to keep lookups by order_id fast.
CREATE INDEX IF NOT EXISTS "shipment_order_id_idx" ON "shipping"."shipment"("order_id");
