import type { SeedContext } from '../seed-types';

const C: Record<string, string> = {
  'perro-pipeta-antiparasitaria-unidad': 'https://res.cloudinary.com/dmagqy229/image/upload/v1779066951/perro-pipeta-antiparasitaria-unidad_fdtwnm.png',
  'perro-pipeta-antiparasitaria-pack':   'https://res.cloudinary.com/dmagqy229/image/upload/v1779066950/perro-pipeta-antiparasitaria-pack_mqmkpc.png',
  'gato-pipeta-antiparasitaria-verde':   'https://res.cloudinary.com/dmagqy229/image/upload/v1779066949/gato-pipeta-antiparasitaria-verde_s2nqyg.png',
  'gato-pipeta-antiparasitaria-blanca':  'https://res.cloudinary.com/dmagqy229/image/upload/v1779066948/gato-pipeta-antiparasitaria-blanca_fbaljh.png',
  'perro-shampoo-botella-gris':          'https://res.cloudinary.com/dmagqy229/image/upload/v1779066951/perro-shampoo-botella-gris_jbf8c0.png',
  'perro-shampoo-botella-marron':        'https://res.cloudinary.com/dmagqy229/image/upload/v1779066952/perro-shampoo-botella-marron_spndse.png',
  'gato-shampoo-botella-azul':           'https://res.cloudinary.com/dmagqy229/image/upload/v1779066949/gato-shampoo-botella-azul_sbqegd.png',
  'perro-peine-cerdas-naranja':          'https://res.cloudinary.com/dmagqy229/image/upload/v1779067159/perro-peine-cerdas-naranja_qq5gwt.png',
  'gato-peine-cerdas-naranja':           '',
  'ave-limpiador-jaula-spray':           'https://res.cloudinary.com/dmagqy229/image/upload/v1779066946/ave-limpiador-jaula-spray_rlqhw7.png',
  'pez-oxigenador-acuario-verde':        'https://res.cloudinary.com/dmagqy229/image/upload/v1779067201/pez-oxigenador-acuario-verde_wnu8do.png',
  'pez-vitaminas-frasco-blanco':         'https://res.cloudinary.com/dmagqy229/image/upload/v1779066953/pez-vitaminas-frasco-blanco_ynbxbx.png',
  'pez-vitaminas-caja-naranja':          'https://res.cloudinary.com/dmagqy229/image/upload/v1779066953/pez-vitaminas-caja-naranja_n4l5sw.png',
  'ave-vitaminas-caja-verde':            'https://res.cloudinary.com/dmagqy229/image/upload/v1779066947/ave-vitaminas-caja-verde_gdpku7.png',
  'ave-vitaminas-caja-naranja':          'https://res.cloudinary.com/dmagqy229/image/upload/v1779066947/ave-vitaminas-caja-naranja_bwbyp6.png',
  'ave-vitaminas-caja-amarilla':         'https://res.cloudinary.com/dmagqy229/image/upload/v1779066946/ave-vitaminas-caja-amarilla_i62t8k.png',
};

const img = (k: string) => C[k] || undefined;

export async function seedHigiene({ seedProduct, wid, cats, A, col, ani }: SeedContext) {
  console.log('Creando higiene y salud...');

  // ── Perros ──────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Pipeta Antiparasitaria para Perros', slug: 'pipeta-antiparasitaria-perro',
    description: 'Pipeta de aplicación dorsal contra pulgas y garrapatas. Protección mensual.',
    categoryId: cats.higieneP, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('perro-pipeta-antiparasitaria-unidad'),
    variants: [{ sku: 'PERRO-PIPETA-ANTIP-UNIDAD', price: 1800, attributeValueIds: [ani.perro] }],
  });

  await seedProduct({
    name: 'Pipeta Antiparasitaria para Perros Pack x12', slug: 'pipeta-antiparasitaria-perro-pack',
    description: 'Pack de 12 pipetas para protección continua durante un año.',
    categoryId: cats.higieneP, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('perro-pipeta-antiparasitaria-pack'),
    variants: [{ sku: 'PERRO-PIPETA-ANTIP-PACK-12', price: 18000, attributeValueIds: [ani.perro] }],
  });

  await seedProduct({
    name: 'Shampoo para Perros', slug: 'shampoo-perro',
    description: 'Shampoo suave con fórmula hipoalérgénica. Ideal para pieles sensibles.',
    categoryId: cats.higieneP, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'PERRO-SHAMPOO-BOTELLA-GRIS',   price: 1500, attributeValueIds: [col.gris,   ani.perro], url: img('perro-shampoo-botella-gris')   },
      { sku: 'PERRO-SHAMPOO-BOTELLA-MARRON', price: 1800, attributeValueIds: [col.marron, ani.perro], url: img('perro-shampoo-botella-marron') },
    ],
  });

  // ── Gatos ───────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Pipeta Antiparasitaria para Gatos', slug: 'pipeta-antiparasitaria-gato',
    description: 'Pipeta antiparasitaria de amplio espectro para gatos de interior y exterior.',
    categoryId: cats.higieneG, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'GATO-PIPETA-ANTIP-VERDE',  price: 1600, attributeValueIds: [col.verde,  ani.gato], url: img('gato-pipeta-antiparasitaria-verde')  },
      { sku: 'GATO-PIPETA-ANTIP-BLANCA', price: 1600, attributeValueIds: [col.blanco, ani.gato], url: img('gato-pipeta-antiparasitaria-blanca') },
    ],
  });

  await seedProduct({
    name: 'Shampoo para Gatos', slug: 'shampoo-gato',
    description: 'Shampoo específico para gatos con pH balanceado y fragancia suave.',
    categoryId: cats.higieneG, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'GATO-SHAMPOO-BOTELLA-AZUL', price: 1600, attributeValueIds: [col.azul, ani.gato], url: img('gato-shampoo-botella-azul') },
    ],
  });

  // ── Compartido perro/gato ────────────────────────────────────────────────

  await seedProduct({
    name: 'Peine para Mascotas', slug: 'peine-mascotas',
    description: 'Peine de cerdas finas para desenredar y limpiar el pelaje.',
    categoryId: cats.higieneP, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'PERRO-PEINE-CERDAS-NARANJA', price: 900, attributeValueIds: [col.naranja, ani.perro], url: img('perro-peine-cerdas-naranja') },
      { sku: 'GATO-PEINE-CERDAS-NARANJA',  price: 900, attributeValueIds: [col.naranja, ani.gato],  url: img('gato-peine-cerdas-naranja')  },
    ],
  });

  // ── Aves ─────────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Limpiador de Jaula para Aves', slug: 'limpiador-jaula-ave',
    description: 'Spray limpiador y desinfectante para jaulas. Fórmula segura para aves.',
    categoryId: cats.higieneA, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('ave-limpiador-jaula-spray'),
    variants: [{ sku: 'AVE-LIMPIADOR-JAULA-SPRAY', price: 1200, attributeValueIds: [ani.ave] }],
  });

  await seedProduct({
    name: 'Vitaminas para Aves', slug: 'vitaminas-ave',
    description: 'Complejo vitamínico para aves de compañía. Mejora plumaje y vitalidad.',
    categoryId: cats.higieneA, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'AVE-VITAMINAS-VERDE',    price: 1400, attributeValueIds: [col.verde,    ani.ave], url: img('ave-vitaminas-caja-verde')    },
      { sku: 'AVE-VITAMINAS-NARANJA',  price: 1400, attributeValueIds: [col.naranja,  ani.ave], url: img('ave-vitaminas-caja-naranja')  },
      { sku: 'AVE-VITAMINAS-AMARILLO', price: 1400, attributeValueIds: [col.amarillo, ani.ave], url: img('ave-vitaminas-caja-amarilla') },
    ],
  });

  // ── Peces ────────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Oxigenador para Acuario', slug: 'oxigenador-acuario-pez',
    description: 'Bomba de aire con dos salidas regulables. Silenciosa y eficiente.',
    categoryId: cats.higienePez, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('pez-oxigenador-acuario-verde'),
    variants: [{ sku: 'PEZ-OXIGENADOR-ACUARIO', price: 2800, attributeValueIds: [ani.pez] }],
  });

  await seedProduct({
    name: 'Vitaminas para Peces en Frasco', slug: 'vitaminas-frasco-pez',
    description: 'Suplemento vitamínico en cápsulas para reforzar el sistema inmune de los peces.',
    categoryId: cats.higienePez, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('pez-vitaminas-frasco-blanco'),
    variants: [{ sku: 'PEZ-VITAMINAS-FRASCO', price: 1500, attributeValueIds: [ani.pez] }],
  });

  await seedProduct({
    name: 'Vitaminas para Peces en Caja', slug: 'vitaminas-caja-pez',
    description: 'Vitaminas líquidas en gotero para acuarios de agua dulce y salada.',
    categoryId: cats.higienePez, warehouseId: wid, attributeIds: [A.animal],
    productImageUrl: img('pez-vitaminas-caja-naranja'),
    variants: [{ sku: 'PEZ-VITAMINAS-CAJA', price: 1800, attributeValueIds: [ani.pez] }],
  });
}
