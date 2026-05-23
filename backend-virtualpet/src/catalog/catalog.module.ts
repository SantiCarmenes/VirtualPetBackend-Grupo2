import { Module } from '@nestjs/common';
import { CatalogAttributeController } from './controllers/catalog-attribute.controller';
import { CatalogCategoryController } from './controllers/catalog-category.controller';
import { CatalogProductController } from './controllers/catalog-product.controller';
import { CatalogVariantController } from './controllers/catalog-variant.controller';
import { CatalogRepository } from './catalog.repository';
import { CATALOG_SERVICE } from './interfaces/catalog-service.interface';
import { AttributeService } from './services/attribute.service';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';

@Module({
  controllers: [
    CatalogCategoryController,
    CatalogProductController,
    CatalogAttributeController,
    CatalogVariantController,
  ],
  providers: [
    CatalogRepository,
    CategoryService,
    ProductService,
    AttributeService,
    VariantService,
    { provide: CATALOG_SERVICE, useClass: VariantService },
  ],
  exports: [CATALOG_SERVICE],
})
export class CatalogModule {}
