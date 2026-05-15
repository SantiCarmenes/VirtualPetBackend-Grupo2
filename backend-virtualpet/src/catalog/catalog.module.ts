import { Module } from '@nestjs/common';
import { CatalogAttributeController } from './controllers/catalog-attribute.controller';
import { CatalogCategoryController } from './controllers/catalog-category.controller';
import { CatalogProductController } from './controllers/catalog-product.controller';
import { CatalogVariantController } from './controllers/catalog-variant.controller';
import { CatalogRepository } from './catalog.repository';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [
    CatalogCategoryController,
    CatalogProductController,
    CatalogAttributeController,
    CatalogVariantController,
  ],
  providers: [CatalogService, CatalogRepository],
  exports: [CatalogService],
})
export class CatalogModule {}
