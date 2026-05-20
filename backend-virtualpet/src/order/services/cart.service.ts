import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATALOG_SERVICE } from '../../catalog/interfaces/catalog-service.interface';
import type { ICatalogService } from '../../catalog/interfaces/catalog-service.interface';
import { ICartService } from '../interfaces/cart-service.interface';
import { OrderRepository } from '../order.repository';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class CartService implements ICartService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject(CATALOG_SERVICE) private readonly catalogService: ICatalogService,
  ) {}

  private async getRawCart(userId: string) {
    return (
      (await this.orderRepository.findCartByUserId(userId)) ??
      (await this.orderRepository.createCart(userId))
    );
  }

  async getOrCreateCart(userId: string) {
    const cart = await this.getRawCart(userId);

    // Enriquecer items con datos del variant (cross-schema: no hay FK en DB)
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        const variant = await this.catalogService.findVariantById(item.variantId);
        return {
          ...item,
          variant: variant
            ? {
                id:                variant.id,
                sku:               variant.sku,
                price:             Number(variant.price),
                images:            variant.images.length > 0 ? variant.images : ((variant.product as any)?.images ?? []),
                product:           variant.product,
                variantAttributes: variant.variantAttributes,
              }
            : null,
        };
      }),
    );

    return { ...cart, items: enrichedItems };
  }

  async addItemToCart(userId: string, dto: AddCartItemDto) {
    const variant = await this.catalogService.findVariantById(dto.variantId);
    if (!variant || !variant.active) {
      throw new NotFoundException('Variante no encontrada o inactiva');
    }

    const cart = await this.getRawCart(userId);
    const existing = await this.orderRepository.findCartItemByVariant(cart.id, dto.variantId);

    if (existing) {
      return this.orderRepository.updateCartItem(existing.id, {
        quantity: existing.quantity + dto.quantity,
        priceSnapshot: variant.price,
      });
    }

    return this.orderRepository.createCartItem({
      cart: { connect: { id: cart.id } },
      variantId: dto.variantId,
      quantity: dto.quantity,
      priceSnapshot: variant.price,
    });
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.orderRepository.findCartItemById(itemId);
    if (!item) throw new NotFoundException('Item no encontrado');

    const cart = await this.getRawCart(userId);
    if (cart.id !== item.cartId) throw new ForbiddenException();

    return this.orderRepository.updateCartItem(itemId, { quantity: dto.quantity });
  }

  async removeCartItem(userId: string, itemId: string): Promise<void> {
    const item = await this.orderRepository.findCartItemById(itemId);
    if (!item) throw new NotFoundException('Item no encontrado');

    const cart = await this.getRawCart(userId);
    if (cart.id !== item.cartId) throw new ForbiddenException();

    await this.orderRepository.deleteCartItem(itemId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.orderRepository.findCartByUserId(userId);
    if (cart) await this.orderRepository.deleteCartItems(cart.id);
  }
}
