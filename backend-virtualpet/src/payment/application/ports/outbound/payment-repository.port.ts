import type { PaymentStatusEnum } from '../../../domain/payment-status.enum';

export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY';

export interface PaymentRecord {
  id:        string;
  orderId:   string;
  method:    string;
  status:    string;
  amount:    { toString(): string };
  currency:  string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCreateData {
  orderId:  string;
  method:   string;
  amount:   { toString(): string };
  currency: string;
}

export interface IPaymentRepository {
  create(data: PaymentCreateData): Promise<PaymentRecord>;
  findByOrderId(orderId: string): Promise<PaymentRecord | null>;
  updateStatus(orderId: string, status: PaymentStatusEnum): Promise<PaymentRecord>;
}
