import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CART_SERVICE } from '../interfaces/cart-service.interface';
import type { ICartService } from '../interfaces/cart-service.interface';

@Controller('cart')
export class CartController {
  constructor(@Inject(CART_SERVICE) private readonly cartService: ICartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItemToCart(user.id, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.cartService.removeCartItem(user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }
}
