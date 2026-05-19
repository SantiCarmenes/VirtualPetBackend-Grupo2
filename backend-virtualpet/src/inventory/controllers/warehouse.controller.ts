import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { WarehouseService } from '../services/warehouse.service';

@Controller('warehouses')
@Roles('BACKOFFICE')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(dto);
  }

  @Get()
  findAll() {
    return this.warehouseService.findAllWarehouses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findWarehouseById(id);
  }
}
