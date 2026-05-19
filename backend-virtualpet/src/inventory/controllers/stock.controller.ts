import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UpsertStockDto } from '../dto/upsert-stock.dto';
import { StockService } from '../services/stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles('BACKOFFICE')
  upsert(@Body() dto: UpsertStockDto) {
    return this.stockService.upsertStock(dto);
  }

  @Get('variants/:variantId')
  @Public()
  getByVariant(@Param('variantId') variantId: string) {
    return this.stockService.getStockByVariant(variantId);
  }
}
