import { Module } from '@nestjs/common';
import { CatalogAttributeController } from './controllers/catalog-attribute.controller';
import { CatalogCategoryController } from './controllers/catalog-category.controller';
import { CatalogProductController } from './controllers/catalog-product.controller';
import { CatalogVariantController } from './controllers/catalog-variant.controller';
import { CatalogRepository } from './catalog.repository';
import { CATALOG_SERVICE } from './interfaces/catalog-service.interface';
import { CATEGORY_SERVICE } from './interfaces/category-service.interface';
import { PRODUCT_SERVICE } from './interfaces/product-service.interface';
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
    { provide: CATALOG_SERVICE,  useClass: VariantService },
    { provide: PRODUCT_SERVICE,  useClass: ProductService },
    { provide: CATEGORY_SERVICE, useClass: CategoryService },
  ],
  exports: [CATALOG_SERVICE, PRODUCT_SERVICE, CATEGORY_SERVICE],
})
export class CatalogModule {}
