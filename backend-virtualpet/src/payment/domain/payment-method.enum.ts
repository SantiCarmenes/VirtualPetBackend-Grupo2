export enum PaymentMethodEnum {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
}

export interface PaymentMethodOption {
  code: PaymentMethodEnum;
  name: string;
  description: string;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { code: PaymentMethodEnum.CASH,        name: 'Efectivo',               description: 'Pago en efectivo contra entrega' },
  { code: PaymentMethodEnum.CREDIT_CARD, name: 'Tarjeta de crédito',     description: 'Visa, Mastercard, American Express' },
  { code: PaymentMethodEnum.DEBIT_CARD,  name: 'Tarjeta de débito',      description: 'Visa Débito, Maestro' },
  { code: PaymentMethodEnum.TRANSFER,    name: 'Transferencia bancaria',  description: 'CBU o Alias bancario' },
];
