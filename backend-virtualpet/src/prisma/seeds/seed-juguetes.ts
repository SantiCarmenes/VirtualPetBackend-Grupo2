import type { SeedContext } from '../seed-types';

const CLD: Record<string, string> = {
  'perro-juguete-pelota-goma-roja':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701575/perro-juguete-pelota-goma-roja_vfzva8.png',
  'perro-juguete-pelota-goma-verde':  'https://res.cloudinary.com/dmagqy229/image/upload/v1778701575/perro-juguete-pelota-goma-verde_m5csu5.png',
  'perro-juguete-pelota-goma-azul':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701575/perro-juguete-pelota-goma-azul_o7zqj4.png',
  'perro-juguete-hueso-goma-verde':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-hueso-goma-verde_w5tjie.png',
  'perro-juguete-hueso-goma-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-hueso-goma-azul_hcyr3w.png',
  'perro-juguete-hueso-goma-natural': 'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-hueso-goma-natural_nofcmm.png',
  'perro-juguete-frisbee-verde':      'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-frisbee-verde_hqkyat.png',
  'perro-juguete-frisbee-azul':       'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-frisbee-azul_ujgenj.png',
  'perro-juguete-frisbee-rojo':       'https://res.cloudinary.com/dmagqy229/image/upload/v1778701574/perro-juguete-frisbee-rojo_rlszp1.png',
  'gato-juguete-raton-verde':         'https://res.cloudinary.com/dmagqy229/image/upload/v1778701566/gato-juguete-raton-verde_qk6ae8.png',
  'gato-juguete-raton-marron':        'https://res.cloudinary.com/dmagqy229/image/upload/v1778701566/gato-juguete-raton-marron_hzufk5.png',
  'gato-juguete-raton-azul':          'https://res.cloudinary.com/dmagqy229/image/upload/v1778701566/gato-juguete-raton-azul_iogowk.png',
  'gato-juguete-ovillo-verde':        'https://res.cloudinary.com/dmagqy229/image/upload/v1778701566/gato-juguete-ovillo-verde_dr4cra.png',
  'gato-juguete-ovillo-rosa':         'https://res.cloudinary.com/dmagqy229/image/upload/v1778701565/gato-juguete-ovillo-rosa_e19xth.png',
  'gato-juguete-ovillo-azul':         'https://res.cloudinary.com/dmagqy229/image/upload/v1778701565/gato-juguete-ovillo-azul_darcgy.png',
  'gato-juguete-laser-negro':         'https://res.cloudinary.com/dmagqy229/image/upload/v1778701565/gato-juguete-laser-negro_a312if.png',
  'gato-juguete-laser-azul-2':        'https://res.cloudinary.com/dmagqy229/image/upload/v1778701565/gato-juguete-laser-azul-2_f12mwj.png',
  'gato-juguete-laser-azul-1':        'https://res.cloudinary.com/dmagqy229/image/upload/v1778701565/gato-juguete-laser-azul-1_dgd3pn.png',
};

export async function seedJuguetes({ seedProduct, wid, cats, A, col, mat, ani }: SeedContext) {
  console.log('Creando juguetes...');

  // ── Gatos ───────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Ratón de Felpa para Gatos', slug: 'juguete-raton-gato',
    description: 'Ratón de felpa suave con cola larga, ideal para estimular el instinto cazador.',
    categoryId: cats.juguetesG, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'GATO-JUGUETE-RATON-MARRON', price: 1200, attributeValueIds: [col.marron, mat.felpa, ani.gato], url: CLD['gato-juguete-raton-marron'] },
      { sku: 'GATO-JUGUETE-RATON-AZUL',   price: 1200, attributeValueIds: [col.azul,   mat.felpa, ani.gato], url: CLD['gato-juguete-raton-azul']   },
      { sku: 'GATO-JUGUETE-RATON-VERDE',  price: 1200, attributeValueIds: [col.verde,  mat.felpa, ani.gato], url: CLD['gato-juguete-raton-verde']  },
    ],
  });

  await seedProduct({
    name: 'Ovillo de Lana para Gatos', slug: 'juguete-ovillo-gato',
    description: 'Ovillo de lana compacto, el juguete clásico para gatos inquietos.',
    categoryId: cats.juguetesG, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'GATO-JUGUETE-OVILLO-ROSA',  price: 800, attributeValueIds: [col.rosa,  mat.lana, ani.gato], url: CLD['gato-juguete-ovillo-rosa']  },
      { sku: 'GATO-JUGUETE-OVILLO-AZUL',  price: 800, attributeValueIds: [col.azul,  mat.lana, ani.gato], url: CLD['gato-juguete-ovillo-azul']  },
      { sku: 'GATO-JUGUETE-OVILLO-VERDE', price: 800, attributeValueIds: [col.verde, mat.lana, ani.gato], url: CLD['gato-juguete-ovillo-verde'] },
    ],
  });

  await seedProduct({
    name: 'Puntero Láser para Gatos', slug: 'juguete-laser-gato',
    description: 'Puntero láser para sesiones de juego interactivo.',
    categoryId: cats.juguetesG, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'GATO-JUGUETE-LASER-NEGRO',  price: 1500, attributeValueIds: [col.negro, ani.gato], url: CLD['gato-juguete-laser-negro']  },
      { sku: 'GATO-JUGUETE-LASER-AZUL-1', price: 1500, attributeValueIds: [col.azul,  ani.gato], url: CLD['gato-juguete-laser-azul-1'] },
      { sku: 'GATO-JUGUETE-LASER-AZUL-2', price: 1500, attributeValueIds: [col.azul,  ani.gato], url: CLD['gato-juguete-laser-azul-2'] },
    ],
  });

  // ── Perros ──────────────────────────────────────────────────────────────

  await seedProduct({
    name: 'Pelota de Goma para Perros', slug: 'juguete-pelota-goma-perro',
    description: 'Pelota de goma resistente con protuberancias para limpieza dental.',
    categoryId: cats.juguetesP, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-JUGUETE-PELOTA-ROJO',  price: 1000, attributeValueIds: [col.rojo,  mat.goma, ani.perro], url: CLD['perro-juguete-pelota-goma-roja']  },
      { sku: 'PERRO-JUGUETE-PELOTA-AZUL',  price: 1000, attributeValueIds: [col.azul,  mat.goma, ani.perro], url: CLD['perro-juguete-pelota-goma-azul']  },
      { sku: 'PERRO-JUGUETE-PELOTA-VERDE', price: 1000, attributeValueIds: [col.verde, mat.goma, ani.perro], url: CLD['perro-juguete-pelota-goma-verde'] },
    ],
  });

  await seedProduct({
    name: 'Frisbee para Perros', slug: 'juguete-frisbee-perro',
    description: 'Frisbee de goma flexible, ideal para jugar al aire libre.',
    categoryId: cats.juguetesP, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-JUGUETE-FRISBEE-ROJO',  price: 1200, attributeValueIds: [col.rojo,  mat.goma, ani.perro], url: CLD['perro-juguete-frisbee-rojo']  },
      { sku: 'PERRO-JUGUETE-FRISBEE-AZUL',  price: 1200, attributeValueIds: [col.azul,  mat.goma, ani.perro], url: CLD['perro-juguete-frisbee-azul']  },
      { sku: 'PERRO-JUGUETE-FRISBEE-VERDE', price: 1200, attributeValueIds: [col.verde, mat.goma, ani.perro], url: CLD['perro-juguete-frisbee-verde'] },
    ],
  });

  await seedProduct({
    name: 'Hueso de Goma para Perros', slug: 'juguete-hueso-goma-perro',
    description: 'Hueso de goma durable para perros que aman morder.',
    categoryId: cats.juguetesP, warehouseId: wid, attributeIds: [A.color, A.material, A.animal],
    variants: [
      { sku: 'PERRO-JUGUETE-HUESO-NATURAL', price: 900, attributeValueIds: [col.natural, mat.goma, ani.perro], url: CLD['perro-juguete-hueso-goma-natural'] },
      { sku: 'PERRO-JUGUETE-HUESO-AZUL',    price: 900, attributeValueIds: [col.azul,    mat.goma, ani.perro], url: CLD['perro-juguete-hueso-goma-azul']    },
      { sku: 'PERRO-JUGUETE-HUESO-VERDE',   price: 900, attributeValueIds: [col.verde,   mat.goma, ani.perro], url: CLD['perro-juguete-hueso-goma-verde']   },
    ],
  });
}
