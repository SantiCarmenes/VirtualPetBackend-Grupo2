-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payment";
CREATE SCHEMA IF NOT EXISTS "shipping";

-- CreateEnum
CREATE TYPE "payment"."PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER');

-- CreateEnum
CREATE TYPE "payment"."PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "shipping"."ShipmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED');

-- CreateTable
CREATE TABLE "payment"."payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "method" "payment"."PaymentMethod" NOT NULL,
    "status" "payment"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_order_id_key" ON "payment"."payment"("order_id");

-- CreateTable
CREATE TABLE "shipping"."shipping_method" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(10,2) NOT NULL,
    "estimated_days" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shipping_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping"."shipment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "method_id" TEXT NOT NULL,
    "status" "shipping"."ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "tracking_number" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipment_order_id_key" ON "shipping"."shipment"("order_id");

-- AddForeignKey
ALTER TABLE "shipping"."shipment" ADD CONSTRAINT "shipment_method_id_fkey"
    FOREIGN KEY ("method_id") REFERENCES "shipping"."shipping_method"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
