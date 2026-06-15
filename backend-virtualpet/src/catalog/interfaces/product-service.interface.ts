export const PRODUCT_SERVICE = 'PRODUCT_SERVICE';

export interface IProductService {
  findAll(filters: { search?: string; active?: boolean; limit?: number }): Promise<unknown>;
}
