import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ICatalogService, VariantWithProduct } from '../interfaces/catalog-service.interface';
import { CatalogRepository } from '../catalog.repository';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@Injectable()
export class VariantService implements ICatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findVariantById(id: string): Promise<VariantWithProduct | null> {
    return this.catalogRepository.findVariantWithProduct(id);
  }

  findVariantsByIds(ids: string[]): Promise<VariantWithProduct[]> {
    return this.catalogRepository.findVariantsByIds(ids) as Promise<VariantWithProduct[]>;
  }

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
}
