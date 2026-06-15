export const CATEGORY_SERVICE = 'CATEGORY_SERVICE';

export interface ICategoryService {
  findAll(): Promise<unknown>;
}
