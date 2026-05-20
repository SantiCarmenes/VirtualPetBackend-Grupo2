import type { PaymentStatusEnum } from '../../../domain/payment-status.enum';
import type { PaymentMethodOption } from '../../../domain/payment-method.enum';
import type { PaymentRecord } from '../outbound/payment-repository.port';
import type { CreatePaymentDto } from '../../../dto/create-payment.dto';

export const PAYMENT_SERVICE = 'PAYMENT_SERVICE';

export interface IPaymentService {
  getPaymentMethods(): PaymentMethodOption[];
  createPayment(dto: CreatePaymentDto): Promise<PaymentRecord>;
  getPaymentByOrderId(orderId: string): Promise<PaymentRecord>;
  updatePaymentStatus(orderId: string, status: PaymentStatusEnum): Promise<PaymentRecord>;
}
