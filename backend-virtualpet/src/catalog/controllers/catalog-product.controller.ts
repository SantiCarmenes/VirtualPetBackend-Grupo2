import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';

@Controller('catalog/products')
export class CatalogProductController {
  private readonly logger = new Logger(CatalogProductController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() filters: FilterProductsDto) {
    this.logger.log(`GET /catalog/products — filters: ${JSON.stringify(filters)}`);
    const result = await this.productService.findAll(filters);
    this.logger.log(`GET /catalog/products — result: total=${result.total} returned=${result.data.length}`);
    return result;
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.productService.deactivate(id);
  }

  @Roles('BACKOFFICE')
  @Post(':productId/variants')
  createVariant(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.variantService.createVariant(productId, dto);
  }
}
