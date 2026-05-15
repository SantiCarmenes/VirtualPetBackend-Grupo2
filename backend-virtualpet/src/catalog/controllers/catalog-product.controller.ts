import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CatalogService } from '../catalog.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('catalog/products')
export class CatalogProductController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll(@Query() filters: FilterProductsDto) {
    return this.catalogService.findAllProducts(filters);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.catalogService.findProductBySlug(slug);
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.catalogService.deactivateProduct(id);
  }

  @Roles('BACKOFFICE')
  @Post(':productId/variants')
  createVariant(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.catalogService.createVariant(productId, dto);
  }
}
