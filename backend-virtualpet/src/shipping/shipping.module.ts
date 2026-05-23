import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShippingController } from './infrastructure/http/shipping.controller';
import { ShippingRepository } from './infrastructure/persistence/shipping.repository';
import { ShippingService } from './application/shipping.service';
import { SHIPPING_SERVICE } from './application/ports/inbound/shipping-service.port';
import { SHIPPING_REPOSITORY } from './application/ports/outbound/shipping-repository.port';

@Module({
  imports: [PrismaModule],
  controllers: [ShippingController],
  providers: [
    ShippingRepository,
    ShippingService,
    { provide: SHIPPING_REPOSITORY, useClass: ShippingRepository },
    { provide: SHIPPING_SERVICE,    useClass: ShippingService },
  ],
  exports: [SHIPPING_SERVICE],
})
export class ShippingModule {}
