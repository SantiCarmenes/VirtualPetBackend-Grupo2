import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CatalogService } from '../catalog.service';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@Controller('catalog/variants')
export class CatalogVariantController {
  constructor(private readonly catalogService: CatalogService) {}

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.catalogService.updateVariant(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.catalogService.deactivateVariant(id);
  }
}
