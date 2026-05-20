import type { SeedContext } from '../seed-types';

const C: Record<string, string> = {
  'pez-acuario-nano-negro':        'https://res.cloudinary.com/dmagqy229/image/upload/v1779066937/pez-acuario-nano-negro_oysqgy.png',
  'pez-acuario-rectangular-negro': 'https://res.cloudinary.com/dmagqy229/image/upload/v1779066938/pez-acuario-rectangular-negro_vlzzvk.png',
  'pez-acuario-arco-marino':       'https://res.cloudinary.com/dmagqy229/image/upload/v1779066937/pez-acuario-arco-marino_xzbbcv.png',
  'pez-acuario-panoramico-negro':  'https://res.cloudinary.com/dmagqy229/image/upload/v1779066938/pez-acuario-panoramico-negro_uztron.png',
  'pez-acuario-marino-grande':     'https://res.cloudinary.com/dmagqy229/image/upload/v1779066937/pez-acuario-marino-grande_swiw1w.png',
  'pez-filtro-externo-negro':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779067189/pez-filtro-externo-negro_ebyzp0.png',
  'pez-calefactor-esferico-negro': 'https://res.cloudinary.com/dmagqy229/image/upload/v1779066938/pez-calefactor-esferico-negro_oxfjqt.png',
  'pez-filtro-interior-azul':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779067175/pez-filtro-interior-azul_sbbevq.png',
};

const img = (k: string) => C[k] || undefined;

export async function seedAccesoriosPez({ seedProduct, wid, cats, A, col, ani }: SeedContext) {
  console.log('Creando accesorios peces...');

  await seedProduct({
    name: 'Acuario Nano para Peces', slug: 'acuario-nano-pez',
    description: 'Acuario cubo de vidrio ultra-claro, ideal para betta y peces pequeños. 15 L.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-acuario-nano-negro'),
    variants: [
      { sku: 'PEZ-ACUARIO-NANO-NEGRO', price: 12000, attributeValueIds: [col.negro, ani.pez] },
    ],
  });

  await seedProduct({
    name: 'Acuario con Iluminación LED', slug: 'acuario-iluminacion-pez',
    description: 'Acuario rectangular con tapa y barra LED integrada. 60 L.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-acuario-rectangular-negro'),
    variants: [
      { sku: 'PEZ-ACUARIO-LED-NEGRO', price: 28000, attributeValueIds: [col.negro, ani.pez] },
    ],
  });

  await seedProduct({
    name: 'Acuario Marino Arco', slug: 'acuario-arco-marino-pez',
    description: 'Acuario marino con frente curvado panorámico. Ideal para arrecifes de coral. 200 L.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-acuario-arco-marino'),
    variants: [
      { sku: 'PEZ-ACUARIO-ARCO-MARINO', price: 65000, attributeValueIds: [col.negro, ani.pez] },
    ],
  });

  await seedProduct({
    name: 'Acuario Panorámico para Peces', slug: 'acuario-panoramico-pez',
    description: 'Acuario hexagonal de vidrio con vista en 270°. Incluye iluminación. 300 L.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-acuario-panoramico-negro'),
    variants: [
      { sku: 'PEZ-ACUARIO-PANORAMICO', price: 85000, attributeValueIds: [col.negro, ani.pez] },
    ],
  });

  await seedProduct({
    name: 'Acuario Marino XL', slug: 'acuario-marino-xl-pez',
    description: 'Acuario rectangular de gran capacidad con soporte de madera incluido. 400 L.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-acuario-marino-grande'),
    variants: [
      { sku: 'PEZ-ACUARIO-MARINO-XL', price: 120000, attributeValueIds: [col.negro, ani.pez] },
    ],
  });

  await seedProduct({
    name: 'Filtro para Acuario', slug: 'filtro-acuario-pez',
    description: 'Sistema de filtración para acuario. Versión externa e interna disponibles.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'PEZ-FILTRO-EXTERNO-NEGRO', price: 9500, attributeValueIds: [col.negro, ani.pez], url: img('pez-filtro-externo-negro')  },
      { sku: 'PEZ-FILTRO-INTERIOR-AZUL', price: 6500, attributeValueIds: [col.azul,  ani.pez], url: img('pez-filtro-interior-azul') },
    ],
  });

  await seedProduct({
    name: 'Calefactor para Acuario', slug: 'calefactor-acuario-pez',
    description: 'Calefactor esférico sumergible con control de temperatura automático.',
    categoryId: cats.accesoriosPez, warehouseId: wid, attributeIds: [A.color, A.animal],
    productImageUrl: img('pez-calefactor-esferico-negro'),
    variants: [
      { sku: 'PEZ-CALEFACTOR-NEGRO', price: 4500, attributeValueIds: [col.negro, ani.pez] },
    ],
  });
}
