import { Module } from '@nestjs/common';
import { StockController } from './controllers/stock.controller';
import { WarehouseController } from './controllers/warehouse.controller';
import { InventoryRepository } from './inventory.repository';
import { STOCK_SERVICE } from './interfaces/stock-service.interface';
import { StockService } from './services/stock.service';
import { WarehouseService } from './services/warehouse.service';

@Module({
  controllers: [WarehouseController, StockController],
  providers: [
    InventoryRepository,
    WarehouseService,
    StockService,
    { provide: STOCK_SERVICE, useClass: StockService },
  ],
  exports: [STOCK_SERVICE],
})
export class InventoryModule {}
