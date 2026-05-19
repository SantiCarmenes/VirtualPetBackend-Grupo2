-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateTable
CREATE TABLE "inventory"."warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" JSONB NOT NULL,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."stock_item" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."stock_reservation" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_code_key" ON "inventory"."warehouse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_item_variant_id_warehouse_id_key" ON "inventory"."stock_item"("variant_id", "warehouse_id");

-- AddForeignKey
ALTER TABLE "inventory"."stock_item" ADD CONSTRAINT "stock_item_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."stock_reservation" ADD CONSTRAINT "stock_reservation_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "inventory"."stock_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
