import type { ProductVariant } from '@prisma/client';

export const CATALOG_SERVICE = 'CATALOG_SERVICE';

export type VariantWithProduct = ProductVariant & {
  product: { id: string; name: string; slug: string };
  images: { id: string; url: string }[];
  variantAttributes: {
    attributeValue: {
      id: string;
      value: string;
      slug: string;
      attribute: { name: string };
    };
  }[];
};

export interface ICatalogService {
  findVariantById(id: string): Promise<VariantWithProduct | null>;
  findVariantsByIds(ids: string[]): Promise<VariantWithProduct[]>;
}
