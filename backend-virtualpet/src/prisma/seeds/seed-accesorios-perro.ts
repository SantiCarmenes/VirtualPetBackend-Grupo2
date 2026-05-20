import type { SeedContext } from '../seed-types';

const CLD: Record<string, string> = {
  'perro-cucha-madera-naranja': 'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-cucha-madera-naranja_ez9whv.png',
  'perro-cucha-madera-gris':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701548/perro-cucha-madera-gris_naisnc.png',
  'perro-cucha-madera-marron':  'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-cucha-madera-marron_vocjkd.png',
  'perro-correa-nylon-negra':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-correa-nylon-negra_bpvyws.png',
  'perro-correa-nylon-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-correa-nylon-azul_keje41.png',
  'perro-collar-nylon-negro':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701546/perro-collar-nylon-negro_gwla6z.png',
  'perro-collar-nylon-marron':  'https://res.cloudinary.com/dmagqy229/image/upload/v1778701546/perro-collar-nylon-marron_zcqnh1.png',
  'perro-collar-nylon-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701546/perro-collar-nylon-azul_qavei3.png',
  'perro-bowl-acero-rojo':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779050184/perro-bowl-acero-rojo_rkbyjo.png',
  'perro-bowl-acero-gris':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779050196/perro-bowl-acero-gris_tetfd5.png',
  'perro-bowl-acero-azul':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779050207/perro-bowl-acero-azul_xdax6d.png',
  'perro-ropa-camisa-formal':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-ropa-camisa-formal_pxpikd.png',
  'perro-ropa-chaleco-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701547/perro-ropa-chaleco-azul_axqeaf.png',
  'perro-ropa-disfraz-navidad': 'https://res.cloudinary.com/dmagqy229/image/upload/v1778701548/perro-ropa-disfraz-navidad_ikfysg.png',
};

export async function seedAccesoriosPerro({ seedProduct, wid, cats, A, col, mat, ani, talle }: SeedContext) {
  console.log('Creando accesorios y ropa perro...');

  await seedProduct({
    name: 'Cucha de Madera para Perros', slug: 'cucha-madera-perro',
    description: 'Cucha de madera resistente con techo de colores.',
    categoryId: cats.accesorios, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-CUCHA-MADERA-NARANJA', price: 18000, attributeValueIds: [col.naranja, mat.madera, ani.perro], url: CLD['perro-cucha-madera-naranja'] },
      { sku: 'PERRO-CUCHA-MADERA-GRIS',    price: 18000, attributeValueIds: [col.gris,    mat.madera, ani.perro], url: CLD['perro-cucha-madera-gris']    },
      { sku: 'PERRO-CUCHA-MADERA-MARRON',  price: 18000, attributeValueIds: [col.marron,  mat.madera, ani.perro], url: CLD['perro-cucha-madera-marron']  },
    ],
  });

  await seedProduct({
    name: 'Correa de Nylon para Perros', slug: 'correa-nylon-perro',
    description: 'Correa liviana y resistente de nylon.',
    categoryId: cats.accesorios, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-CORREA-NYLON-NEGRO', price: 3500, attributeValueIds: [col.negro, mat.nylon, ani.perro], url: CLD['perro-correa-nylon-negra'] },
      { sku: 'PERRO-CORREA-NYLON-AZUL',  price: 3500, attributeValueIds: [col.azul,  mat.nylon, ani.perro], url: CLD['perro-correa-nylon-azul']  },
    ],
  });

  await seedProduct({
    name: 'Collar de Nylon para Perros', slug: 'collar-nylon-perro',
    description: 'Collar de nylon con placa identificadora incluida.',
    categoryId: cats.accesorios, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-COLLAR-NYLON-AZUL',   price: 2500, attributeValueIds: [col.azul,   mat.nylon, ani.perro], url: CLD['perro-collar-nylon-azul']   },
      { sku: 'PERRO-COLLAR-NYLON-MARRON', price: 2500, attributeValueIds: [col.marron, mat.nylon, ani.perro], url: CLD['perro-collar-nylon-marron'] },
      { sku: 'PERRO-COLLAR-NYLON-NEGRO',  price: 2500, attributeValueIds: [col.negro,  mat.nylon, ani.perro], url: CLD['perro-collar-nylon-negro']  },
    ],
  });

  await seedProduct({
    name: 'Bowl de Acero Inoxidable para Perros', slug: 'bowl-acero-perro',
    description: 'Bowl de acero inoxidable con base antideslizante.',
    categoryId: cats.accesorios, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-BOWL-ACERO-AZUL', price: 1800, attributeValueIds: [col.azul, mat.acero, ani.perro], url: CLD['perro-bowl-acero-azul'] },
      { sku: 'PERRO-BOWL-ACERO-GRIS', price: 1800, attributeValueIds: [col.gris, mat.acero, ani.perro], url: CLD['perro-bowl-acero-gris'] },
      { sku: 'PERRO-BOWL-ACERO-ROJO', price: 1800, attributeValueIds: [col.rojo, mat.acero, ani.perro], url: CLD['perro-bowl-acero-rojo'] },
    ],
  });

  await seedProduct({
    name: 'Camisa Formal para Perros', slug: 'camisa-formal-perro',
    description: 'Camisa a cuadros con moño rojo, ideal para ocasiones especiales.',
    categoryId: cats.ropas, warehouseId: wid, attributeIds: [A.animal, A.talle],
    variants: [
      { sku: 'PERRO-ROPA-CAMISA-XS', price: 4500, attributeValueIds: [ani.perro, talle.xs], url: CLD['perro-ropa-camisa-formal'] },
      { sku: 'PERRO-ROPA-CAMISA-S',  price: 4500, attributeValueIds: [ani.perro, talle.s],  url: CLD['perro-ropa-camisa-formal'] },
      { sku: 'PERRO-ROPA-CAMISA-M',  price: 4500, attributeValueIds: [ani.perro, talle.m],  url: CLD['perro-ropa-camisa-formal'] },
      { sku: 'PERRO-ROPA-CAMISA-L',  price: 4800, attributeValueIds: [ani.perro, talle.l],  url: CLD['perro-ropa-camisa-formal'] },
      { sku: 'PERRO-ROPA-CAMISA-XL', price: 4800, attributeValueIds: [ani.perro, talle.xl], url: CLD['perro-ropa-camisa-formal'] },
    ],
  });

  await seedProduct({
    name: 'Chaleco para Perros', slug: 'chaleco-perro',
    description: 'Chaleco abrigado con estampado, para días frescos.',
    categoryId: cats.ropas, warehouseId: wid, attributeIds: [A.color, A.animal, A.talle],
    variants: [
      { sku: 'PERRO-ROPA-CHALECO-AZUL-XS', price: 3500, attributeValueIds: [col.azul, ani.perro, talle.xs], url: CLD['perro-ropa-chaleco-azul'] },
      { sku: 'PERRO-ROPA-CHALECO-AZUL-S',  price: 3500, attributeValueIds: [col.azul, ani.perro, talle.s],  url: CLD['perro-ropa-chaleco-azul'] },
      { sku: 'PERRO-ROPA-CHALECO-AZUL-M',  price: 3500, attributeValueIds: [col.azul, ani.perro, talle.m],  url: CLD['perro-ropa-chaleco-azul'] },
      { sku: 'PERRO-ROPA-CHALECO-AZUL-L',  price: 3800, attributeValueIds: [col.azul, ani.perro, talle.l],  url: CLD['perro-ropa-chaleco-azul'] },
      { sku: 'PERRO-ROPA-CHALECO-AZUL-XL', price: 3800, attributeValueIds: [col.azul, ani.perro, talle.xl], url: CLD['perro-ropa-chaleco-azul'] },
    ],
  });

  await seedProduct({
    name: 'Disfraz Navideño para Perros', slug: 'disfraz-navidad-perro',
    description: 'Disfraz de Papá Noel para las fiestas.',
    categoryId: cats.ropas, warehouseId: wid, attributeIds: [A.animal, A.talle],
    variants: [
      { sku: 'PERRO-ROPA-DISFRAZ-XS', price: 5500, attributeValueIds: [ani.perro, talle.xs], url: CLD['perro-ropa-disfraz-navidad'] },
      { sku: 'PERRO-ROPA-DISFRAZ-S',  price: 5500, attributeValueIds: [ani.perro, talle.s],  url: CLD['perro-ropa-disfraz-navidad'] },
      { sku: 'PERRO-ROPA-DISFRAZ-M',  price: 5500, attributeValueIds: [ani.perro, talle.m],  url: CLD['perro-ropa-disfraz-navidad'] },
      { sku: 'PERRO-ROPA-DISFRAZ-L',  price: 5800, attributeValueIds: [ani.perro, talle.l],  url: CLD['perro-ropa-disfraz-navidad'] },
      { sku: 'PERRO-ROPA-DISFRAZ-XL', price: 5800, attributeValueIds: [ani.perro, talle.xl], url: CLD['perro-ropa-disfraz-navidad'] },
    ],
  });
}
