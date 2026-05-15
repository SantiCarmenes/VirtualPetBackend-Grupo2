import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CatalogService } from '../catalog.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('catalog/categories')
export class CatalogCategoryController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll() {
    return this.catalogService.findAllCategories();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findCategoryById(id);
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }
}
