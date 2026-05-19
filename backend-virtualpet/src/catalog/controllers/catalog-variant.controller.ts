import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { VariantService } from '../services/variant.service';

@Controller('catalog/variants')
export class CatalogVariantController {
  constructor(private readonly variantService: VariantService) {}

  @Roles('BACKOFFICE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.variantService.updateVariant(id, dto);
  }

  @Roles('BACKOFFICE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.variantService.deactivateVariant(id);
  }
}
