import type { SeedContext } from '../seed-types';

const C: Record<string, string> = {
  'gato-cama-nido-natural':        'https://res.cloudinary.com/dmagqy229/image/upload/v1779066925/gato-cama-nido-natural_dj9ska.png',
  'gato-cama-nido-negra':          'https://res.cloudinary.com/dmagqy229/image/upload/v1779066926/gato-cama-nido-negra_ibgl6i.png',
  'gato-collar-cascabel-violeta':  'https://res.cloudinary.com/dmagqy229/image/upload/v1779066927/gato-collar-cascabel-violeta_puduza.png',
  'gato-collar-cascabel-rojo':     'https://res.cloudinary.com/dmagqy229/image/upload/v1779066927/gato-collar-cascabel-rojo_vniuz8.png',
  'gato-collar-cascabel-marron':   'https://res.cloudinary.com/dmagqy229/image/upload/v1779066926/gato-collar-cascabel-marron_lnl4fo.png',
  'gato-rascador-arbol-gris-1':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066927/gato-rascador-arbol-gris-1_p2khru.png',
  'gato-rascador-arbol-gris-2':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066928/gato-rascador-arbol-gris-2_audbtx.png',
  'gato-transportadora-marron':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066928/gato-transportadora-marron_wcmcoh.png',
  'gato-transportadora-azul':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779066928/gato-transportadora-azul_uzy3ii.png',
  'gato-transportadora-verde':     'https://res.cloudinary.com/dmagqy229/image/upload/v1779066929/gato-transportadora-verde_gjo8fu.png',
  'gato-bowl-inteligente-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066925/gato-bowl-inteligente-azul_uafvbk.png',
  'gato-bowl-inteligente-rojo':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066925/gato-bowl-inteligente-rojo_zuba7z.png',
  'gato-bowl-inteligente-verde':   'https://res.cloudinary.com/dmagqy229/image/upload/v1779066925/gato-bowl-inteligente-verde_iohyij.png',
};

const img = (k: string) => C[k] || undefined;

export async function seedAccesoriosGato({ seedProduct, wid, cats, A, col, mat, ani, talle }: SeedContext) {
  console.log('Creando accesorios gatos...');

  await seedProduct({
    name: 'Cama Nido para Gatos', slug: 'cama-nido-gato',
    description: 'Cama nido de madera con cojín acolchado suave. Diseño escandinavo.',
    categoryId: cats.accesoriosG, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'GATO-CAMA-NIDO-NATURAL', price: 7500, attributeValueIds: [col.natural, mat.madera, ani.gato], url: img('gato-cama-nido-natural') },
      { sku: 'GATO-CAMA-NIDO-NEGRA',   price: 7500, attributeValueIds: [col.negro,   mat.madera, ani.gato], url: img('gato-cama-nido-negra')   },
    ],
  });

  await seedProduct({
    name: 'Collar con Cascabel para Gatos', slug: 'collar-cascabel-gato',
    description: 'Collar ajustable de nylon con cascabel sonoro. Liviano y seguro.',
    categoryId: cats.accesoriosG, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'GATO-COLLAR-CASCABEL-VIOLETA', price: 1200, attributeValueIds: [col.violeta, mat.nylon, ani.gato], url: img('gato-collar-cascabel-violeta') },
      { sku: 'GATO-COLLAR-CASCABEL-ROJO',    price: 1200, attributeValueIds: [col.rojo,    mat.nylon, ani.gato], url: img('gato-collar-cascabel-rojo')    },
      { sku: 'GATO-COLLAR-CASCABEL-MARRON',  price: 1200, attributeValueIds: [col.marron,  mat.nylon, ani.gato], url: img('gato-collar-cascabel-marron')  },
    ],
  });

  await seedProduct({
    name: 'Árbol Rascador para Gatos', slug: 'rascador-arbol-gato',
    description: 'Árbol rascador multinivel con cueva, plataformas y juguete colgante.',
    categoryId: cats.accesoriosG, warehouseId: wid, attributeIds: [A.color, A.animal, A.talle],
    variants: [
      { sku: 'GATO-RASCADOR-ARBOL-M', price: 18000, attributeValueIds: [col.gris, ani.gato, talle.m], url: img('gato-rascador-arbol-gris-1') },
      { sku: 'GATO-RASCADOR-ARBOL-L', price: 22000, attributeValueIds: [col.gris, ani.gato, talle.l], url: img('gato-rascador-arbol-gris-2') },
    ],
  });

  await seedProduct({
    name: 'Transportadora para Gatos', slug: 'transportadora-gato',
    description: 'Transportadora rígida con puerta metálica y ventilación lateral. Apta para viajes.',
    categoryId: cats.accesoriosG, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'GATO-TRANSPORTADORA-MARRON', price: 5500, attributeValueIds: [col.marron, ani.gato], url: img('gato-transportadora-marron') },
      { sku: 'GATO-TRANSPORTADORA-AZUL',   price: 5500, attributeValueIds: [col.azul,   ani.gato], url: img('gato-transportadora-azul')   },
      { sku: 'GATO-TRANSPORTADORA-VERDE',  price: 5500, attributeValueIds: [col.verde,  ani.gato], url: img('gato-transportadora-verde')  },
    ],
  });

  await seedProduct({
    name: 'Bowl Inteligente para Gatos', slug: 'bowl-inteligente-gato',
    description: 'Bowl electrónico con visor de cantidad y control de porciones.',
    categoryId: cats.accesoriosG, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'GATO-BOWL-INTELIGENTE-AZUL',  price: 8000, attributeValueIds: [col.azul,  ani.gato], url: img('gato-bowl-inteligente-azul')  },
      { sku: 'GATO-BOWL-INTELIGENTE-ROJO',  price: 8000, attributeValueIds: [col.rojo,  ani.gato], url: img('gato-bowl-inteligente-rojo')  },
      { sku: 'GATO-BOWL-INTELIGENTE-VERDE', price: 8000, attributeValueIds: [col.verde, ani.gato], url: img('gato-bowl-inteligente-verde') },
    ],
  });
}
