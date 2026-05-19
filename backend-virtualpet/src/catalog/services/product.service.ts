import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../catalog.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findAll(filters: FilterProductsDto) {
    return this.catalogRepository.findAllProducts(filters);
  }

  async findBySlug(slug: string) {
    const product = await this.catalogRepository.findProductBySlug(slug);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slugInUse = await this.catalogRepository.findProductBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createProduct(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
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

  async deactivate(id: string) {
    const product = await this.catalogRepository.findProductById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.catalogRepository.updateProduct(id, { active: false });
  }
}
