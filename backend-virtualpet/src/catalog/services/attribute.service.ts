import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../catalog.repository';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { CreateAttributeValueDto } from '../dto/create-attribute-value.dto';

@Injectable()
export class AttributeService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findAll(filterableOnly: boolean) {
    return this.catalogRepository.findAllAttributes(filterableOnly);
  }

  async create(dto: CreateAttributeDto) {
    const slugInUse = await this.catalogRepository.findAttributeBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createAttribute(dto);
  }

  async createValue(attributeId: string, dto: CreateAttributeValueDto) {
    const attribute = await this.catalogRepository.findAttributeById(attributeId);
    if (!attribute) throw new NotFoundException('Atributo no encontrado');
    return this.catalogRepository.createAttributeValue(attributeId, dto);
  }
}
