import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { IPromotionService } from '../interfaces/promotion-service.interface';
import { OrderRepository } from '../order.repository';
import { ApplyPromotionDto } from '../dto/apply-promotion.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';

@Injectable()
export class PromotionService implements IPromotionService {
  constructor(private readonly orderRepository: OrderRepository) {}

  createPromotion(dto: CreatePromotionDto) {
    return this.orderRepository.createPromotion({
      code: dto.code,
      value: dto.value,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      maxUses: dto.maxUses,
      conditions: dto.conditions as object,
      active: dto.active ?? true,
    });
  }

  findAllPromotions() {
    return this.orderRepository.findAllPromotions();
  }

  async applyPromotion(userId: string, orderId: string, dto: ApplyPromotionDto) {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new ForbiddenException();
    if (order.status !== OrderStatus.RECEIVED) {
      throw new BadRequestException('Solo se pueden aplicar promociones a órdenes recién recibidas');
    }

    const promotion = await this.orderRepository.findPromotionByCode(dto.code);
    if (!promotion) throw new NotFoundException('Código de promoción inválido');
    if (!promotion.active) throw new BadRequestException('La promoción no está activa');

    const now = new Date();
    if (now < promotion.validFrom || now > promotion.validUntil) {
      throw new BadRequestException('La promoción está fuera de su período de validez');
    }
    if (promotion.currentUses >= promotion.maxUses) {
      throw new BadRequestException('La promoción ha alcanzado su límite de usos');
    }

    const existing = await this.orderRepository.findAppliedPromotion(orderId, promotion.id);
    if (existing) throw new ConflictException('La promoción ya fue aplicada a esta orden');

    const newDiscountTotal = new Prisma.Decimal(order.discountTotal).add(promotion.value);
    const rawTotal = new Prisma.Decimal(order.subtotal).add(order.shippingCost).sub(newDiscountTotal);
    const newTotal = rawTotal.isNegative() ? new Prisma.Decimal(0) : rawTotal;

    const [applied] = await Promise.all([
      this.orderRepository.createAppliedPromotion({
        order: { connect: { id: orderId } },
        promotion: { connect: { id: promotion.id } },
        discountAmount: promotion.value,
      }),
      this.orderRepository.updateOrder(orderId, {
        discountTotal: newDiscountTotal,
        total: newTotal,
      }),
      this.orderRepository.incrementPromotionUses(promotion.id),
    ]);

    return applied;
  }
}
