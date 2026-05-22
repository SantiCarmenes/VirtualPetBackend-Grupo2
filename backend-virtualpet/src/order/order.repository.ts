import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Cart ─────────────────────────────────────────────────────────────────

  findCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
  }

  createCart(userId: string) {
    return this.prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  deleteCartItems(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  // ─── Cart Items ───────────────────────────────────────────────────────────

  findCartItemById(id: string) {
    return this.prisma.cartItem.findUnique({ where: { id } });
  }

  findCartItemByVariant(cartId: string, variantId: string) {
    return this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    });
  }

  createCartItem(data: Prisma.CartItemCreateInput) {
    return this.prisma.cartItem.create({ data });
  }

  updateCartItem(id: string, data: Prisma.CartItemUpdateInput) {
    return this.prisma.cartItem.update({ where: { id }, data });
  }

  deleteCartItem(id: string) {
    return this.prisma.cartItem.delete({ where: { id } });
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  createOrder(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
      include: { items: true, appliedPromotions: { include: { promotion: true } } },
    });
  }

  findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        appliedPromotions: { include: { promotion: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  addStatusHistory(orderId: string, status: string) {
    return this.prisma.orderStatusHistory.create({
      data: { orderId, status: status as never },
    });
  }

  async findOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, appliedPromotions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrdersByUserIdPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, appliedPromotions: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return {
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: { items: true, appliedPromotions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrdersPaginated(page: number, limit: number, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = status ? { status } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true, appliedPromotions: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const groups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const counts: Record<string, number> = {
      RECEIVED: 0,
      IN_PREPARATION: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      NOT_DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const g of groups) {
      counts[g.status] = g._count._all;
    }

    return counts;
  }

  findOrdersPendingReschedule() {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.NOT_DELIVERED,
        nextDeliveryAt: { lte: new Date() },
      },
    });
  }

  claimGuestOrders(email: string, userId: string) {
    return this.prisma.order.updateMany({
      where: { customerEmail: email, userId: { startsWith: 'guest-' } },
      data: { userId },
    });
  }

  updateOrder(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: { items: true, appliedPromotions: { include: { promotion: true } } },
    });
  }

  // ─── Promotions ───────────────────────────────────────────────────────────

  findPromotionByCode(code: string) {
    return this.prisma.promotion.findUnique({ where: { code } });
  }

  createPromotion(data: Prisma.PromotionCreateInput) {
    return this.prisma.promotion.create({ data });
  }

  findAllPromotions() {
    return this.prisma.promotion.findMany({ orderBy: { validFrom: 'desc' } });
  }

  incrementPromotionUses(id: string) {
    return this.prisma.promotion.update({
      where: { id },
      data: { currentUses: { increment: 1 } },
    });
  }

  // ─── Applied Promotions ───────────────────────────────────────────────────

  createAppliedPromotion(data: Prisma.AppliedPromotionCreateInput) {
    return this.prisma.appliedPromotion.create({ data, include: { promotion: true } });
  }

  findAppliedPromotion(orderId: string, promotionId: string) {
    return this.prisma.appliedPromotion.findUnique({
      where: { orderId_promotionId: { orderId, promotionId } },
    });
  }
}
