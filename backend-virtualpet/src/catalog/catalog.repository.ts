import { Injectable } from '@nestjs/common';
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
    const where: Prisma.ProductWhereInput = {};

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.active !== undefined) where.active = filters.active;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.attributeValueIds?.length) {
      where.variants = {
        some: {
          active: true,
          variantAttributes: {
            some: { attributeValueId: { in: filters.attributeValueIds } },
          },
        },
      };
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { active: true },
        select: { id: true, sku: true, price: true, active: true },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, include, orderBy: { name: 'asc' }, skip, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findProductBySlug(slug: string) {
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
