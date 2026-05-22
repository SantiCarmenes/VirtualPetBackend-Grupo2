import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryService } from '../services/category.service';

@Controller('catalog/categories')
export class CatalogCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Public()
  @Get('attributes')
  findAttributes() {
    return this.categoryService.findAttributesByCategory();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
