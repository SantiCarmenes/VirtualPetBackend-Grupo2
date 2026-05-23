-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateEnum
CREATE TYPE "catalog"."AttributeType" AS ENUM ('TEXT', 'NUMERIC', 'COLOR', 'BOOLEAN');

-- CreateTable
CREATE TABLE "catalog"."category" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."product" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."product_variant" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."product_image" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "catalog"."AttributeType" NOT NULL,
    "unit" TEXT,
    "filterable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."attribute_value" (
    "id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."product_attribute" (
    "product_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,

    CONSTRAINT "product_attribute_pkey" PRIMARY KEY ("product_id","attribute_id")
);

-- CreateTable
CREATE TABLE "catalog"."product_variant_attribute" (
    "variant_id" TEXT NOT NULL,
    "attribute_value_id" TEXT NOT NULL,

    CONSTRAINT "product_variant_attribute_pkey" PRIMARY KEY ("variant_id","attribute_value_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "catalog"."category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "catalog"."product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "catalog"."product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_slug_key" ON "catalog"."attribute"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_value_attribute_id_slug_key" ON "catalog"."attribute_value"("attribute_id", "slug");

-- AddForeignKey
ALTER TABLE "catalog"."category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "catalog"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_variant" ADD CONSTRAINT "product_variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_image" ADD CONSTRAINT "product_image_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."attribute_value" ADD CONSTRAINT "attribute_value_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_attribute" ADD CONSTRAINT "product_attribute_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_attribute" ADD CONSTRAINT "product_attribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "catalog"."attribute_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
