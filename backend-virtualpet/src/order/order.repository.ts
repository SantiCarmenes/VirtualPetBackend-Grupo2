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
      include: { items: true, appliedPromotions: { include: { promotion: true } } },
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
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: { items: true, appliedPromotions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrdersPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        include: { items: true, appliedPromotions: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
