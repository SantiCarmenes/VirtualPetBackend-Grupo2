export const STOCK_SERVICE = 'STOCK_SERVICE';

export interface IStockService {
  checkStockOrThrow(items: { variantId: string; quantity: number }[]): Promise<void>;
  reserveStock(orderId: string, items: { variantId: string; quantity: number }[]): Promise<void>;
  releaseReservation(orderId: string): Promise<void>;
  confirmReservation(orderId: string): Promise<void>;
}
