export type SeedProductParams = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  attributeIds: string[];
  warehouseId: string;
  stockPerVariant?: number;
  productImageUrl?: string;
  variants: {
    sku: string;
    price: number;
    url?: string;
    attributeValueIds: string[];
  }[];
};

export type SeedContext = {
  seedProduct: (params: SeedProductParams) => Promise<any>;
  wid: string;
  cats: Record<string, string>;
  A: Record<string, string>;
  col: Record<string, string>;
  mat: Record<string, string>;
  ani: Record<string, string>;
  sabor: Record<string, string>;
  peso: Record<string, string>;
  talle: Record<string, string>;
};
