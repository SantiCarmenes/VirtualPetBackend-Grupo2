import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CatalogService } from '../catalog.service';
import { CreateAttributeValueDto } from '../dto/create-attribute-value.dto';
import { CreateAttributeDto } from '../dto/create-attribute.dto';

@Controller('catalog/attributes')
export class CatalogAttributeController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll(@Query('filterable') filterable?: string) {
    return this.catalogService.findAllAttributes(filterable === 'true');
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateAttributeDto) {
    return this.catalogService.createAttribute(dto);
  }

  @Roles('BACKOFFICE')
  @Post(':id/values')
  createValue(@Param('id') id: string, @Body() dto: CreateAttributeValueDto) {
    return this.catalogService.createAttributeValue(id, dto);
  }
}
