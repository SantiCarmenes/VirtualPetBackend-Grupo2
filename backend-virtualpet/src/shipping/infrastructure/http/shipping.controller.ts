import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { SHIPPING_SERVICE } from '../../application/ports/inbound/shipping-service.port';
import type { IShippingService } from '../../application/ports/inbound/shipping-service.port';
import { CreateShipmentDto } from '../../dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from '../../dto/update-shipment-status.dto';

@Controller('shipping')
export class ShippingController {
  constructor(
    @Inject(SHIPPING_SERVICE) private readonly shippingService: IShippingService,
  ) {}

  @Public()
  @Get('methods')
  getShippingMethods() {
    return this.shippingService.getShippingMethods();
  }

  @Post()
  @Roles('BACKOFFICE')
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto);
  }

  @Public()
  @Get('orders/:orderId')
  getShipmentByOrder(@Param('orderId') orderId: string) {
    return this.shippingService.getShipmentByOrderId(orderId);
  }

  @Patch('orders/:orderId/status')
  @Roles('BACKOFFICE')
  updateShipmentStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shippingService.updateShipmentStatus(orderId, dto.status);
  }
}
