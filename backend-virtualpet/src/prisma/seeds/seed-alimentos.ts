import type { SeedContext } from '../seed-types';

const CLD: Record<string, string> = {
  'perro-alimento-croquetas-bolsa-negra':  'https://res.cloudinary.com/dmagqy229/image/upload/v1778701723/perro-alimento-croquetas-bolsa-negra_qmrwet.png',
  'perro-alimento-croquetas-bolsa-kraft':  'https://res.cloudinary.com/dmagqy229/image/upload/v1778701723/perro-alimento-croquetas-bolsa-kraft_zrvca2.png',
  'perro-alimento-croquetas-bolsa-roja':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701723/perro-alimento-croquetas-bolsa-roja_wiypys.png',
  'perro-alimento-croquetas-bolsa-marron': 'https://res.cloudinary.com/dmagqy229/image/upload/v1778701723/perro-alimento-croquetas-bolsa-marron_zfuaul.png',
  'gato-alimento-croquetas-bolsa-violeta': 'https://res.cloudinary.com/dmagqy229/image/upload/v1778701554/gato-alimento-croquetas-bolsa-violeta_scv3yf.png',
  'gato-alimento-croquetas-bolsa-kraft':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701554/gato-alimento-croquetas-bolsa-kraft_ewecf3.png',
  'gato-alimento-croquetas-bolsa-gris':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701554/gato-alimento-croquetas-bolsa-gris_ivzjfx.png',
  'gato-alimento-croquetas-bolsa-azul':    'https://res.cloudinary.com/dmagqy229/image/upload/v1778701554/gato-alimento-croquetas-bolsa-azul_ewkll0.png',
  'ave-alimento-semillas-bolsa-rosa':      'https://res.cloudinary.com/dmagqy229/image/upload/v1778701536/ave-alimento-semillas-bolsa-rosa_p9u3t2.png',
  'ave-alimento-semillas-bolsa-kraft-2':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701536/ave-alimento-semillas-bolsa-kraft-2_arx0no.png',
  'ave-alimento-semillas-bolsa-beige':     'https://res.cloudinary.com/dmagqy229/image/upload/v1778701536/ave-alimento-semillas-bolsa-beige_vzslsp.png',
  'ave-alimento-semillas-bolsa-kraft-1':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778701536/ave-alimento-semillas-bolsa-kraft-1_ajwai2.png',
  'pez-alimento-escamas-bolsa-amarilla':   'https://res.cloudinary.com/dmagqy229/image/upload/v1778696745/pez-alimento-escamas-bolsa-amarilla_ncg7pg.png',
  'pez-alimento-escamas-bolsa-verde':      'https://res.cloudinary.com/dmagqy229/image/upload/v1778696744/pez-alimento-escamas-bolsa-verde_oejzgx.png',
  'pez-alimento-escamas-bolsa-azul':       'https://res.cloudinary.com/dmagqy229/image/upload/v1778694273/pez-alimento-escamas-bolsa-azul_gpu1ry.png',
};

export async function seedAlimentos({ seedProduct, wid, cats, A, ani, sabor, peso }: SeedContext) {
  console.log('Creando alimentos...');

  // -- Perros --

  await seedProduct({
    name: 'Royal Canin Adult Dog', slug: 'perro-alim-royalcanin',
    description: 'Nutrición completa para perros adultos de todas las razas.',
    categoryId: cats.alimentoP, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['perro-alimento-croquetas-bolsa-roja'],
    variants: [
      { sku: 'PERRO-ALIM-ROYALCANIN-POLLO-1KG', price: 3200, attributeValueIds: [ani.perro, sabor.pollo, peso['1kg']] },
      { sku: 'PERRO-ALIM-ROYALCANIN-POLLO-3KG', price: 7500, attributeValueIds: [ani.perro, sabor.pollo, peso['3kg']] },
      { sku: 'PERRO-ALIM-ROYALCANIN-CARNE-1KG', price: 3200, attributeValueIds: [ani.perro, sabor.carne, peso['1kg']] },
      { sku: 'PERRO-ALIM-ROYALCANIN-CARNE-3KG', price: 7500, attributeValueIds: [ani.perro, sabor.carne, peso['3kg']] },
    ],
  });

  await seedProduct({
    name: 'Pedigree Adulto', slug: 'perro-alim-pedigree',
    description: 'Alimento completo y sabroso para perros adultos.',
    categoryId: cats.alimentoP, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['perro-alimento-croquetas-bolsa-marron'],
    variants: [
      { sku: 'PERRO-ALIM-PEDIGREE-POLLO-500G',  price: 1800, attributeValueIds: [ani.perro, sabor.pollo,   peso['500g']] },
      { sku: 'PERRO-ALIM-PEDIGREE-CARNE-500G',  price: 1800, attributeValueIds: [ani.perro, sabor.carne,   peso['500g']] },
      { sku: 'PERRO-ALIM-PEDIGREE-CORDERO-1KG', price: 2800, attributeValueIds: [ani.perro, sabor.cordero, peso['1kg']]  },
    ],
  });

  await seedProduct({
    name: 'Pro Plan Canine Adult', slug: 'perro-alim-proplan',
    description: 'Fórmula avanzada con proteína real como primer ingrediente.',
    categoryId: cats.alimentoP, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['perro-alimento-croquetas-bolsa-negra'],
    variants: [
      { sku: 'PERRO-ALIM-PROPLAN-SALMON-3KG', price: 8500, attributeValueIds: [ani.perro, sabor.salmon, peso['3kg']] },
      { sku: 'PERRO-ALIM-PROPLAN-POLLO-3KG',  price: 7800, attributeValueIds: [ani.perro, sabor.pollo,  peso['3kg']] },
      { sku: 'PERRO-ALIM-PROPLAN-CARNE-3KG',  price: 7500, attributeValueIds: [ani.perro, sabor.carne,  peso['3kg']] },
    ],
  });

  await seedProduct({
    name: 'Dog Chow Adulto', slug: 'perro-alim-dogchow',
    description: 'Nutrición equilibrada al mejor precio para tu perro.',
    categoryId: cats.alimentoP, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['perro-alimento-croquetas-bolsa-kraft'],
    variants: [
      { sku: 'PERRO-ALIM-DOGCHOW-POLLO-1KG', price: 2500, attributeValueIds: [ani.perro, sabor.pollo, peso['1kg']] },
      { sku: 'PERRO-ALIM-DOGCHOW-CARNE-1KG', price: 2500, attributeValueIds: [ani.perro, sabor.carne, peso['1kg']] },
    ],
  });

  // -- Gatos --

  await seedProduct({
    name: 'Royal Canin Cat Adult', slug: 'gato-alim-royalcanin',
    description: 'Nutrición científicamente formulada para gatos adultos.',
    categoryId: cats.alimentoG, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['gato-alimento-croquetas-bolsa-gris'],
    variants: [
      { sku: 'GATO-ALIM-ROYALCANIN-SALMON-500G', price: 2800, attributeValueIds: [ani.gato, sabor.salmon, peso['500g']] },
      { sku: 'GATO-ALIM-ROYALCANIN-SALMON-1KG',  price: 4500, attributeValueIds: [ani.gato, sabor.salmon, peso['1kg']]  },
      { sku: 'GATO-ALIM-ROYALCANIN-POLLO-500G',  price: 2600, attributeValueIds: [ani.gato, sabor.pollo,  peso['500g']] },
      { sku: 'GATO-ALIM-ROYALCANIN-POLLO-1KG',   price: 4200, attributeValueIds: [ani.gato, sabor.pollo,  peso['1kg']]  },
    ],
  });

  await seedProduct({
    name: 'Whiskas Adulto', slug: 'gato-alim-whiskas',
    description: 'El sabor que los gatos aman, con la nutrición que necesitan.',
    categoryId: cats.alimentoG, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['gato-alimento-croquetas-bolsa-kraft'],
    variants: [
      { sku: 'GATO-ALIM-WHISKAS-SALMON-500G', price: 1500, attributeValueIds: [ani.gato, sabor.salmon, peso['500g']] },
      { sku: 'GATO-ALIM-WHISKAS-CARNE-500G',  price: 1500, attributeValueIds: [ani.gato, sabor.carne,  peso['500g']] },
      { sku: 'GATO-ALIM-WHISKAS-MIX-1KG',     price: 2800, attributeValueIds: [ani.gato, sabor.mix,    peso['1kg']]  },
    ],
  });

  await seedProduct({
    name: 'Felix Croccante', slug: 'gato-alim-felix',
    description: 'Croquetas crujientes con sabores irresistibles para tu gato.',
    categoryId: cats.alimentoG, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['gato-alimento-croquetas-bolsa-azul'],
    variants: [
      { sku: 'GATO-ALIM-FELIX-POLLO-500G', price: 1800, attributeValueIds: [ani.gato, sabor.pollo, peso['500g']] },
      { sku: 'GATO-ALIM-FELIX-CARNE-500G', price: 1800, attributeValueIds: [ani.gato, sabor.carne, peso['500g']] },
    ],
  });

  await seedProduct({
    name: 'Pro Plan Cat Adult', slug: 'gato-alim-proplan',
    description: 'Alta proteína para mantener masa muscular magra en gatos.',
    categoryId: cats.alimentoG, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['gato-alimento-croquetas-bolsa-violeta'],
    variants: [
      { sku: 'GATO-ALIM-PROPLAN-SALMON-1KG', price: 5500,  attributeValueIds: [ani.gato, sabor.salmon, peso['1kg']] },
      { sku: 'GATO-ALIM-PROPLAN-POLLO-1KG',  price: 5200,  attributeValueIds: [ani.gato, sabor.pollo,  peso['1kg']] },
      { sku: 'GATO-ALIM-PROPLAN-CARNE-3KG',  price: 12000, attributeValueIds: [ani.gato, sabor.carne,  peso['3kg']] },
    ],
  });

  // -- Aves --

  await seedProduct({
    name: 'Loro Parque Premium', slug: 'ave-alim-loroparque',
    description: 'Mezcla de frutas y semillas premium para loros y cotorras.',
    categoryId: cats.alimentoA, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['ave-alimento-semillas-bolsa-kraft-1'],
    variants: [
      { sku: 'AVE-ALIM-LOROPARQUE-FRUTAS-500G', price: 1200, attributeValueIds: [ani.ave, sabor.frutas, peso['500g']] },
      { sku: 'AVE-ALIM-LOROPARQUE-MIX-1KG',     price: 2200, attributeValueIds: [ani.ave, sabor.mix,    peso['1kg']]  },
    ],
  });

  await seedProduct({
    name: 'Trill Canarios', slug: 'ave-alim-trill',
    description: 'Mezcla de semillas especial para canarios y pájaros pequeños.',
    categoryId: cats.alimentoA, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['ave-alimento-semillas-bolsa-beige'],
    variants: [
      { sku: 'AVE-ALIM-TRILL-MIX-500G',      price: 900,  attributeValueIds: [ani.ave, sabor.mix,      peso['500g']] },
      { sku: 'AVE-ALIM-TRILL-SEMILLAS-1KG',  price: 1600, attributeValueIds: [ani.ave, sabor.semillas, peso['1kg']]  },
    ],
  });

  await seedProduct({
    name: 'Vitakraft Menu Vital', slug: 'ave-alim-vitakraft',
    description: 'Alimento vital con frutas tropicales y semillas para aves exóticas.',
    categoryId: cats.alimentoA, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['ave-alimento-semillas-bolsa-rosa'],
    variants: [
      { sku: 'AVE-ALIM-VITAKRAFT-FRUTAS-500G',   price: 1100, attributeValueIds: [ani.ave, sabor.frutas,   peso['500g']] },
      { sku: 'AVE-ALIM-VITAKRAFT-TROPICAL-500G', price: 1100, attributeValueIds: [ani.ave, sabor.tropical, peso['500g']] },
    ],
  });

  await seedProduct({
    name: 'Montana Mix Natural', slug: 'ave-alim-montana',
    description: 'Semillas naturales sin aditivos para aves de jaula y voliera.',
    categoryId: cats.alimentoA, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['ave-alimento-semillas-bolsa-kraft-2'],
    variants: [
      { sku: 'AVE-ALIM-MONTANA-MIX-500G',      price: 800, attributeValueIds: [ani.ave, sabor.mix,      peso['500g']] },
      { sku: 'AVE-ALIM-MONTANA-SEMILLAS-500G', price: 800, attributeValueIds: [ani.ave, sabor.semillas, peso['500g']] },
    ],
  });

  // -- Peces --

  await seedProduct({
    name: 'Tetra Min Tropical', slug: 'pez-alim-tetra',
    description: 'Escamas flotantes balanceadas para peces tropicales de agua dulce.',
    categoryId: cats.alimentoPez, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['pez-alimento-escamas-bolsa-azul'],
    variants: [
      { sku: 'PEZ-ALIM-TETRA-TROPICAL-100G', price: 900,  attributeValueIds: [ani.pez, sabor.tropical, peso['100g']] },
      { sku: 'PEZ-ALIM-TETRA-TROPICAL-250G', price: 1800, attributeValueIds: [ani.pez, sabor.tropical, peso['250g']] },
      { sku: 'PEZ-ALIM-TETRA-MIX-100G',      price: 900,  attributeValueIds: [ani.pez, sabor.mix,      peso['100g']] },
    ],
  });

  await seedProduct({
    name: 'Aqua One Flakes', slug: 'pez-alim-aquaone',
    description: 'Escamas premium con alta digestibilidad para peces de agua dulce y salada.',
    categoryId: cats.alimentoPez, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['pez-alimento-escamas-bolsa-amarilla'],
    variants: [
      { sku: 'PEZ-ALIM-AQUAONE-TROPICAL-100G', price: 800,  attributeValueIds: [ani.pez, sabor.tropical, peso['100g']] },
      { sku: 'PEZ-ALIM-AQUAONE-MIX-250G',      price: 1500, attributeValueIds: [ani.pez, sabor.mix,      peso['250g']] },
    ],
  });

  await seedProduct({
    name: 'Wardley Pond Flakes', slug: 'pez-alim-wardley',
    description: 'Alimento en escamas para peces de estanque y acuario.',
    categoryId: cats.alimentoPez, warehouseId: wid, attributeIds: [A.animal, A.sabor, A.peso],
    productImageUrl: CLD['pez-alimento-escamas-bolsa-verde'],
    variants: [
      { sku: 'PEZ-ALIM-WARDLEY-MIX-100G',      price: 700,  attributeValueIds: [ani.pez, sabor.mix,      peso['100g']] },
      { sku: 'PEZ-ALIM-WARDLEY-TROPICAL-200G', price: 1200, attributeValueIds: [ani.pez, sabor.tropical, peso['200g']] },
    ],
  });
}
