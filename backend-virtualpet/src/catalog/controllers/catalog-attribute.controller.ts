import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateAttributeValueDto } from '../dto/create-attribute-value.dto';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { AttributeService } from '../services/attribute.service';

@Controller('catalog/attributes')
export class CatalogAttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Public()
  @Get()
  findAll(@Query('filterable') filterable?: string) {
    return this.attributeService.findAll(filterable === 'true');
  }

  @Roles('BACKOFFICE')
  @Post()
  create(@Body() dto: CreateAttributeDto) {
    return this.attributeService.create(dto);
  }

  @Roles('BACKOFFICE')
  @Post(':id/values')
  createValue(@Param('id') id: string, @Body() dto: CreateAttributeValueDto) {
    return this.attributeService.createValue(id, dto);
  }
}
