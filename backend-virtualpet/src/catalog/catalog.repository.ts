import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class CatalogRepository {
  private readonly logger = new Logger(CatalogRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ──────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  findCategoryById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
  }

  findCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  async findAllProducts(filters: FilterProductsDto) {
    this.logger.debug(`findAllProducts — filters: ${JSON.stringify(filters)}`);

    const where: Prisma.ProductWhereInput = { active: true };

    if (filters.categoryIds?.length) {
      // Expande los IDs seleccionados hacia abajo en el árbol de categorías
      // para cubrir jerarquías de cualquier profundidad (top → middle → leaf).
      const childCategories = await this.prisma.category.findMany({
        where: { parentId: { in: filters.categoryIds } },
        select: { id: true },
      });
      const childIds = childCategories.map((c) => c.id);

      const grandchildCategories = childIds.length
        ? await this.prisma.category.findMany({
            where: { parentId: { in: childIds } },
            select: { id: true },
          })
        : [];
      const grandchildIds = grandchildCategories.map((c) => c.id);

      const allCategoryIds = [...new Set([...filters.categoryIds, ...childIds, ...grandchildIds])];
      this.logger.debug(`Category expansion — selected: ${filters.categoryIds.length}, children: ${childIds.length}, grandchildren: ${grandchildIds.length}, total: ${allCategoryIds.length}`);

      where.categoryId = { in: allCategoryIds };
    }

    if (filters.active !== undefined) where.active = filters.active;

    // Full-text search con to_tsvector (soporta stemming en español)
    // Requiere índice GIN: CREATE INDEX ON catalog.product USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description,'')));
    if (filters.search) {
      const matchIds = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM catalog.product
        WHERE to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
              @@ plainto_tsquery('spanish', ${filters.search})
          AND active = true
      `;
      if (matchIds.length === 0) {
        const page  = filters.page  ?? 1;
        const limit = filters.limit ?? 20;
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      where.id = { in: matchIds.map((r) => r.id) };
    }

    // Merge filtro de atributos + rango de precio en la cláusula variants
    const hasAttrFilter  = !!filters.attributeValueIds?.length;
    const hasPriceFilter = filters.minPrice !== undefined || filters.maxPrice !== undefined;

    if (hasAttrFilter || hasPriceFilter) {
      const variantWhere: Record<string, unknown> = { active: true };

      if (hasAttrFilter) {
        // Agrupar los values por atributo padre: OR dentro del mismo atributo, AND entre atributos distintos.
        // Ejemplo: sabor=[pollo,salmon] AND material=[acero] → no mezcla sabores con materiales.
        const attrValues = await this.prisma.attributeValue.findMany({
          where: { id: { in: filters.attributeValueIds } },
          select: { id: true, attributeId: true },
        });
        this.logger.debug(`attributeValue lookup returned ${attrValues.length} rows for ids: ${JSON.stringify(filters.attributeValueIds)}`);
        const byAttribute = new Map<string, string[]>();
        for (const av of attrValues) {
          const group = byAttribute.get(av.attributeId) ?? [];
          group.push(av.id);
          byAttribute.set(av.attributeId, group);
        }
        variantWhere['AND'] = [...byAttribute.values()].map((ids) => ({
          variantAttributes: { some: { attributeValueId: { in: ids } } },
        }));
        this.logger.debug(`variantWhere.AND: ${JSON.stringify(variantWhere['AND'])}`);
      }

      if (hasPriceFilter) {
        variantWhere['price'] = {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        };
      }

      where.variants = { some: variantWhere as Prisma.ProductVariantWhereInput };
    }

    this.logger.debug(`Final where clause: ${JSON.stringify(where)}`);

    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      images:   { where: { isPrimary: true }, take: 1 },
      variants: {
        where:  { active: true },
        select: { id: true, sku: true, price: true, active: true },
      },
    };

    const orderBy = { name: 'asc' as const };

    const [rawData, total] = await Promise.all([
      this.prisma.product.findMany({ where, include, orderBy, skip, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    this.logger.debug(`Query result — total: ${total}, returned: ${rawData.length}`);

    return { data: rawData, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }] },
        variants: {
          where: { active: true },
          include: {
            images: true,
            variantAttributes: {
              include: {
                attributeValue: { include: { attribute: true } },
              },
            },
          },
        },
        productAttributes: {
          include: { attribute: { include: { values: { orderBy: { displayOrder: 'asc' } } } } },
        },
      },
    });
  }

  findProductById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  createProduct(dto: CreateProductDto) {
    const { attributeIds, ...productData } = dto;
    return this.prisma.product.create({
      data: {
        ...productData,
        ...(attributeIds?.length && {
          productAttributes: {
            create: attributeIds.map((attributeId) => ({ attributeId })),
          },
        }),
      },
    });
  }

  updateProduct(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  findVariantById(id: string) {
    return this.prisma.productVariant.findUnique({ where: { id } });
  }

  async findVariantWithProduct(id: string) {
    const v = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, orderBy: { id: 'asc' } },
          },
        },
        images: { take: 1, orderBy: { id: 'asc' } },
        variantAttributes: {
          include: {
            attributeValue: { include: { attribute: true } },
          },
        },
      },
    });
    return v;
  }

  findVariantBySku(sku: string) {
    return this.prisma.productVariant.findUnique({ where: { sku } });
  }

  createVariant(productId: string, dto: CreateVariantDto) {
    const { attributeValueIds, ...variantData } = dto;
    return this.prisma.productVariant.create({
      data: {
        ...variantData,
        productId,
        ...(attributeValueIds?.length && {
          variantAttributes: {
            create: attributeValueIds.map((attributeValueId) => ({ attributeValueId })),
          },
        }),
      },
      include: {
        variantAttributes: {
          include: { attributeValue: { include: { attribute: true } } },
        },
      },
    });
  }

  updateVariant(id: string, dto: UpdateVariantDto) {
    return this.prisma.productVariant.update({ where: { id }, data: dto });
  }

  // ─── Attributes ───────────────────────────────────────────────────────────

  findAllAttributes(filterableOnly: boolean) {
    return this.prisma.attribute.findMany({
      where: filterableOnly ? { filterable: true } : undefined,
      include: { values: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  findAttributeBySlug(slug: string) {
    return this.prisma.attribute.findUnique({ where: { slug } });
  }

  findAttributeById(id: string) {
    return this.prisma.attribute.findUnique({ where: { id } });
  }

  createAttribute(dto: CreateAttributeDto) {
    return this.prisma.attribute.create({ data: dto });
  }

  createAttributeValue(attributeId: string, dto: CreateAttributeValueDto) {
    return this.prisma.attributeValue.create({
      data: { ...dto, attributeId },
    });
  }
}
