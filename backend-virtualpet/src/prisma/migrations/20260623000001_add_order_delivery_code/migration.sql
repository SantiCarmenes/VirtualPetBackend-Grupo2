-- Delivery confirmation code (PIN) sent to the customer when the order goes
-- IN_TRANSIT; the rider must enter it to mark the order as DELIVERED.
ALTER TABLE "order"."order" ADD COLUMN "delivery_code" TEXT;
