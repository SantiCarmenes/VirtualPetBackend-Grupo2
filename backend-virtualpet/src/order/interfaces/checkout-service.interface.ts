import { CheckoutDto } from '../dto/checkout.dto';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';
import { CheckoutResult } from './order-service.interface';

export const CHECKOUT_SERVICE = 'CHECKOUT_SERVICE';

export interface ICheckoutService {
  checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult>;
  guestCheckout(dto: GuestCheckoutDto): Promise<CheckoutResult>;
}
