-- Rename old enum to allow replacing it
ALTER TYPE "order"."OrderStatus" RENAME TO "OrderStatus_old";

-- CreateEnum with new values
CREATE TYPE "order"."OrderStatus" AS ENUM ('RECEIVED', 'IN_PREPARATION', 'IN_TRANSIT', 'DELIVERED', 'NOT_DELIVERED', 'CANCELLED');

-- Migrate existing data: map old statuses to new ones
ALTER TABLE "order"."order"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "order"."OrderStatus"
    USING CASE
      WHEN "status"::text = 'PENDING'    THEN 'RECEIVED'
      WHEN "status"::text = 'CONFIRMED'  THEN 'RECEIVED'
      WHEN "status"::text = 'SHIPPED'    THEN 'IN_TRANSIT'
      WHEN "status"::text = 'DELIVERED'  THEN 'DELIVERED'
      WHEN "status"::text = 'CANCELLED'  THEN 'CANCELLED'
      ELSE 'RECEIVED'
    END::"order"."OrderStatus";

-- Set new default
ALTER TABLE "order"."order" ALTER COLUMN "status" SET DEFAULT 'RECEIVED'::"order"."OrderStatus";

-- Drop old enum
DROP TYPE "order"."OrderStatus_old";

-- Add delivery tracking columns
ALTER TABLE "order"."order" ADD COLUMN "delivery_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "order"."order" ADD COLUMN "next_delivery_at" TIMESTAMP(3);

-- CreateIndex for cron query performance
CREATE INDEX "order_status_next_delivery_at_idx" ON "order"."order"("status", "next_delivery_at");
