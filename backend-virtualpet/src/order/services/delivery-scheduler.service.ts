import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class DeliverySchedulerService {
  private readonly logger = new Logger(DeliverySchedulerService.name);

  constructor(private readonly orderService: OrderService) {}

  // Corre cada hora: busca envíos fallidos cuyo plazo de 24 hs ya venció y los reactiva
  @Cron(CronExpression.EVERY_HOUR)
  async handleDeliveryRetries(): Promise<void> {
    this.logger.log('Verificando reprogramaciones de entrega pendientes...');
    await this.orderService.processPendingReschedules();
  }
}
