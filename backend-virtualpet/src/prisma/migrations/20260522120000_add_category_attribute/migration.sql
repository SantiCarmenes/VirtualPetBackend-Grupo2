-- CreateTable
CREATE TABLE "catalog"."category_attribute" (
    "category_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,

    CONSTRAINT "category_attribute_pkey" PRIMARY KEY ("category_id","attribute_id")
);

-- AddForeignKey
ALTER TABLE "catalog"."category_attribute" ADD CONSTRAINT "category_attribute_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog"."category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."category_attribute" ADD CONSTRAINT "category_attribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
