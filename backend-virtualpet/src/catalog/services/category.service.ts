import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../catalog.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findAll() {
    return this.catalogRepository.findAllCategories();
  }

  async findById(id: string) {
    const category = await this.catalogRepository.findCategoryById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slugInUse = await this.catalogRepository.findCategoryBySlug(dto.slug);
    if (slugInUse) throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    return this.catalogRepository.createCategory(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    if (dto.slug) {
      const slugInUse = await this.catalogRepository.findCategoryBySlug(dto.slug);
      if (slugInUse && slugInUse.id !== id) {
        throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
      }
    }
    return this.catalogRepository.updateCategory(id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.catalogRepository.deleteCategory(id);
  }
}
