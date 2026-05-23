import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { SeedProductParams } from './seed-types';
import { seedAlimentos }       from './seeds/seed-alimentos';
import { seedJuguetes }        from './seeds/seed-juguetes';
import { seedAccesoriosPerro } from './seeds/seed-accesorios-perro';
import { seedAccesoriosGato }  from './seeds/seed-accesorios-gato';
import { seedAccesoriosAve }   from './seeds/seed-accesorios-ave';
import { seedAccesoriosPez }   from './seeds/seed-accesorios-pez';
import { seedHigiene }         from './seeds/seed-higiene';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function seedProduct(params: SeedProductParams) {
  const product = await prisma.product.create({
    data: {
      name: params.name,
      slug: params.slug,
      description: params.description,
      categoryId: params.categoryId,
      active: true,
      productAttributes: {
        create: params.attributeIds.map((attributeId) => ({ attributeId })),
      },
    },
  });

  if (params.productImageUrl) {
    await prisma.productImage.create({
      data: { productId: product.id, url: params.productImageUrl, altText: params.name, isPrimary: true },
    });
  }

  for (const v of params.variants) {
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: v.sku,
        price: v.price,
        active: true,
        variantAttributes: {
          create: v.attributeValueIds.map((attributeValueId) => ({ attributeValueId })),
        },
      },
    });

    if (v.url) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          url: v.url,
          altText: v.sku,
          isPrimary: !params.productImageUrl,
        },
      });
    }

    await prisma.stockItem.create({
      data: {
        variantId: variant.id,
        warehouseId: params.warehouseId,
        quantityAvailable: params.stockPerVariant ?? 20,
      },
    });
  }

  return product;
}

async function makeAttr(name: string, slug: string, type: string, filterable: boolean, values: [string, string][]) {
  const attr = await prisma.attribute.create({ data: { name, slug, type: type as never, filterable } });
  const map: Record<string, string> = {};
  for (const [idx, [s, v]] of values.entries()) {
    const row = await prisma.attributeValue.create({
      data: { attributeId: attr.id, value: v, slug: s, displayOrder: idx },
    });
    map[s] = row.id;
  }
  return { attr, map };
}

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.productVariantAttribute.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await (prisma as any).shipment.deleteMany();
  await (prisma as any).shippingMethod.deleteMany();

  console.log('Creando atributos...');

  const { attr: colorAttr, map: col } = await makeAttr('Color', 'color', 'COLOR', true, [
    ['naranja', 'Naranja'], ['gris', 'Gris'], ['marron', 'Marrón'], ['azul', 'Azul'],
    ['negro', 'Negro'], ['rojo', 'Rojo'], ['verde', 'Verde'], ['rosa', 'Rosa'],
    ['violeta', 'Violeta'], ['amarillo', 'Amarillo'], ['beige', 'Beige'],
    ['natural', 'Natural'], ['kraft', 'Kraft'],
    ['dorado', 'Dorado'], ['plateado', 'Plateado'], ['blanco', 'Blanco'],
  ]);

  const { attr: materialAttr, map: mat } = await makeAttr('Material', 'material', 'TEXT', true, [
    ['madera', 'Madera'], ['nylon', 'Nylon'], ['acero', 'Acero inoxidable'],
    ['goma', 'Goma'], ['felpa', 'Felpa'], ['lana', 'Lana'],
  ]);

  const { attr: animalAttr, map: ani } = await makeAttr('Tipo de animal', 'tipo-animal', 'TEXT', true, [
    ['perro', 'Perro'], ['gato', 'Gato'], ['ave', 'Ave'], ['pez', 'Pez'],
  ]);

  const { attr: saborAttr, map: sabor } = await makeAttr('Sabor', 'sabor', 'TEXT', true, [
    ['pollo', 'Pollo'], ['salmon', 'Salmón'], ['carne', 'Carne'],
    ['cordero', 'Cordero'], ['tropical', 'Tropical'], ['frutas', 'Frutas'],
    ['mix', 'Mix'], ['semillas', 'Semillas'],
  ]);

  const { attr: pesoAttr, map: peso } = await makeAttr('Peso', 'peso', 'TEXT', false, [
    ['100g', '100g'], ['200g', '200g'], ['250g', '250g'],
    ['500g', '500g'], ['1kg', '1kg'], ['3kg', '3kg'], ['5kg', '5kg'],
  ]);

  const { attr: talleAttr, map: talle } = await makeAttr('Talle', 'talle', 'TEXT', true, [
    ['xs', 'XS'], ['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL'],
  ]);

  const A = {
    color: colorAttr.id, material: materialAttr.id, animal: animalAttr.id,
    sabor: saborAttr.id, peso: pesoAttr.id, talle: talleAttr.id,
  };

  console.log('Creando categorías...');

  const catAlimentos  = await prisma.category.create({ data: { name: 'Alimentos',      slug: 'alimentos',     imageUrl: 'https://res.cloudinary.com/dmagqy229/image/upload/v1778962375/alimentos_i44bxt.png'  } });
  const catJuguetes   = await prisma.category.create({ data: { name: 'Juguetes',        slug: 'juguetes',      imageUrl: 'https://res.cloudinary.com/dmagqy229/image/upload/v1778962375/juguetes_it5chq.png'   } });
  const catAccesorios = await prisma.category.create({ data: { name: 'Accesorios',      slug: 'accesorios',    imageUrl: 'https://res.cloudinary.com/dmagqy229/image/upload/v1778962375/accesorios_azip1i.png'  } });
  const catHigiene    = await prisma.category.create({ data: { name: 'Higiene y Salud', slug: 'higiene-salud', imageUrl: 'https://res.cloudinary.com/dmagqy229/image/upload/v1778962376/higienesalud_vaoaxv.png' } });

  const cats = {
    // Alimentos
    alimentoP:    (await prisma.category.create({ data: { name: 'Perros', slug: 'alimentos-perros',    parentId: catAlimentos.id  } })).id,
    alimentoG:    (await prisma.category.create({ data: { name: 'Gatos',  slug: 'alimentos-gatos',     parentId: catAlimentos.id  } })).id,
    alimentoA:    (await prisma.category.create({ data: { name: 'Aves',   slug: 'alimentos-aves',      parentId: catAlimentos.id  } })).id,
    alimentoPez:  (await prisma.category.create({ data: { name: 'Peces',  slug: 'alimentos-peces',     parentId: catAlimentos.id  } })).id,
    // Juguetes
    juguetesP:    (await prisma.category.create({ data: { name: 'Perros', slug: 'juguetes-perros',     parentId: catJuguetes.id   } })).id,
    juguetesG:    (await prisma.category.create({ data: { name: 'Gatos',  slug: 'juguetes-gatos',      parentId: catJuguetes.id   } })).id,
    // Accesorios
    accesorios:   (await prisma.category.create({ data: { name: 'Perros', slug: 'accesorios-perros',   parentId: catAccesorios.id } })).id,
    ropas:        (await prisma.category.create({ data: { name: 'Ropa',   slug: 'accesorios-ropa',     parentId: catAccesorios.id } })).id,
    accesoriosG:  (await prisma.category.create({ data: { name: 'Gatos',  slug: 'accesorios-gatos',    parentId: catAccesorios.id } })).id,
    accesoriosA:  (await prisma.category.create({ data: { name: 'Aves',   slug: 'accesorios-aves',     parentId: catAccesorios.id } })).id,
    accesoriosPez:(await prisma.category.create({ data: { name: 'Peces',  slug: 'accesorios-peces',    parentId: catAccesorios.id } })).id,
    // Higiene
    higieneP:     (await prisma.category.create({ data: { name: 'Perros', slug: 'higiene-perros',      parentId: catHigiene.id    } })).id,
    higieneG:     (await prisma.category.create({ data: { name: 'Gatos',  slug: 'higiene-gatos',       parentId: catHigiene.id    } })).id,
    higieneA:     (await prisma.category.create({ data: { name: 'Aves',   slug: 'higiene-aves',        parentId: catHigiene.id    } })).id,
    higienePez:   (await prisma.category.create({ data: { name: 'Peces',  slug: 'higiene-peces',       parentId: catHigiene.id    } })).id,
  };

  console.log('Vinculando atributos filtrables a categorías...');
  await prisma.categoryAttribute.createMany({
    data: [
      // Alimentos: tipo-animal + sabor
      { categoryId: catAlimentos.id,  attributeId: A.animal },
      { categoryId: catAlimentos.id,  attributeId: A.sabor  },
      // Juguetes: tipo-animal + color + material
      { categoryId: catJuguetes.id,   attributeId: A.animal    },
      { categoryId: catJuguetes.id,   attributeId: A.color     },
      { categoryId: catJuguetes.id,   attributeId: A.material  },
      // Accesorios: tipo-animal + color + material + talle
      { categoryId: catAccesorios.id, attributeId: A.animal    },
      { categoryId: catAccesorios.id, attributeId: A.color     },
      { categoryId: catAccesorios.id, attributeId: A.material  },
      { categoryId: catAccesorios.id, attributeId: A.talle     },
      // Higiene: tipo-animal
      { categoryId: catHigiene.id,    attributeId: A.animal },
    ],
  });

  console.log('Creando depósito...');
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Depósito Virtual Pet MDQ',
      code: 'DEP-MDQ-01',
      address: { street: 'Av. Juan B. Justo 100', city: 'Mar del Plata', province: 'Buenos Aires' },
    },
  });
  const wid = warehouse.id;

  const ctx = { seedProduct, wid, cats, A, col, mat, ani, sabor, peso, talle };

  await seedAlimentos(ctx);
  await seedJuguetes(ctx);
  await seedAccesoriosPerro(ctx);
  await seedAccesoriosGato(ctx);
  await seedAccesoriosAve(ctx);
  await seedAccesoriosPez(ctx);
  await seedHigiene(ctx);

  console.log('Creando método de envío...');
  await (prisma as any).shippingMethod.create({
    data: {
      name: 'Envío propio',
      description: 'Entrega con flota propia en MDQ. Gratis.',
      basePrice: 0,
      estimatedDays: 1,
      active: true,
    },
  });

  console.log('Creando usuarios backoffice...');
  const hash1 = await bcrypt.hash('Admin123!', 10);
  const hash2 = await bcrypt.hash('Oper123!', 10);
  await prisma.user.createMany({
    data: [
      {
        firstName: 'Admin',
        lastName: 'VirtualPet',
        username: 'admin_vp',
        email: 'admin@virtualpet.com',
        passwordHash: hash1,
        role: 'BACKOFFICE',
        isActive: true,
      },
      {
        firstName: 'Operador',
        lastName: 'VirtualPet',
        username: 'operador_vp',
        email: 'operador@virtualpet.com',
        passwordHash: hash2,
        role: 'BACKOFFICE',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Seed completado: 55 productos + 1 depósito + stock por variante + 1 método de envío + 2 usuarios backoffice.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
