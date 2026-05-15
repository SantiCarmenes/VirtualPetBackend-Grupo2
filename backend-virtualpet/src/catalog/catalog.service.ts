import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  // ─── Categories ──────────────────────────────────────────────────────────

  findAllCategories() {
    return this.catalogRepository.findAllCategories();
  }

  async findCategoryById(id: string) {
    const category = await this.catalogRepository.findCategoryById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const slugInUse = await this.catalogRepository.findCategoryBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createCategory(dto);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findCategoryById(id);
    if (dto.slug) {
      const slugInUse = await this.catalogRepository.findCategoryBySlug(dto.slug);
      if (slugInUse && slugInUse.id !== id) {
        throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
      }
    }
    return this.catalogRepository.updateCategory(id, dto);
  }

  async deleteCategory(id: string) {
    await this.findCategoryById(id);
    return this.catalogRepository.deleteCategory(id);
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  findAllProducts(filters: FilterProductsDto) {
    return this.catalogRepository.findAllProducts(filters);
  }

  async findProductBySlug(slug: string) {
    const product = await this.catalogRepository.findProductBySlug(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const slugInUse = await this.catalogRepository.findProductBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createProduct(dto);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.catalogRepository.findProductById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (dto.slug) {
      const slugInUse = await this.catalogRepository.findProductBySlug(dto.slug);
      if (slugInUse && slugInUse.id !== id) {
        throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
      }
    }
    return this.catalogRepository.updateProduct(id, dto);
  }

  async deactivateProduct(id: string) {
    const product = await this.catalogRepository.findProductById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.catalogRepository.updateProduct(id, { active: false });
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  async createVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.catalogRepository.findProductById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const skuInUse = await this.catalogRepository.findVariantBySku(dto.sku);
    if (skuInUse) throw new ConflictException(`El SKU '${dto.sku}' ya está en uso`);

    return this.catalogRepository.createVariant(productId, dto);
  }

  async updateVariant(id: string, dto: UpdateVariantDto) {
    const variant = await this.catalogRepository.findVariantById(id);
    if (!variant) throw new NotFoundException('Variante no encontrada');

    if (dto.sku) {
      const skuInUse = await this.catalogRepository.findVariantBySku(dto.sku);
      if (skuInUse && skuInUse.id !== id) {
        throw new ConflictException(`El SKU '${dto.sku}' ya está en uso`);
      }
    }
    return this.catalogRepository.updateVariant(id, dto);
  }

  async deactivateVariant(id: string) {
    const variant = await this.catalogRepository.findVariantById(id);
    if (!variant) throw new NotFoundException('Variante no encontrada');
    return this.catalogRepository.updateVariant(id, { active: false });
  }

  // ─── Attributes ───────────────────────────────────────────────────────────

  findAllAttributes(filterableOnly: boolean) {
    return this.catalogRepository.findAllAttributes(filterableOnly);
  }

  async createAttribute(dto: CreateAttributeDto) {
    const slugInUse = await this.catalogRepository.findAttributeBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createAttribute(dto);
  }

  async createAttributeValue(attributeId: string, dto: CreateAttributeValueDto) {
    const attribute = await this.catalogRepository.findAttributeById(attributeId);
    if (!attribute) throw new NotFoundException('Atributo no encontrado');
    return this.catalogRepository.createAttributeValue(attributeId, dto);
  }
}
