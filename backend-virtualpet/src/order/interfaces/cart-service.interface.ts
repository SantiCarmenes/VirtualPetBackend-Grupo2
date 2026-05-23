import type { CartItem } from '@prisma/client';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

export const CART_SERVICE = 'CART_SERVICE';

export interface EnrichedCartItem extends CartItem {
  variant: {
    id: string;
    sku: string;
    price: number;
    images: { id: string; url: string }[];
    product: { id: string; name: string; slug: string };
  } | null;
}

export interface ICartService {
  getOrCreateCart(userId: string): Promise<{ id: string; userId: string; createdAt: Date; updatedAt: Date; items: EnrichedCartItem[] }>;
  addItemToCart(userId: string, dto: AddCartItemDto): Promise<CartItem>;
  updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartItem>;
  removeCartItem(userId: string, itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}
