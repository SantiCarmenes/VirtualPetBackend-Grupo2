import type { SeedContext } from '../seed-types';

const C: Record<string, string> = {
  'ave-jaula-redonda-dorada':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-jaula-redonda-dorada_v21v42.png',
  'ave-jaula-redonda-plata':     'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-jaula-redonda-plata_msmroq.png',
  'ave-jaula-redonda-gris':      'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-jaula-redonda-gris_msofjr.png',
  'ave-comedero-colgante-gris':  'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-comedero-colgante-gris_lctqpb.png',
  'ave-comedero-colgante-verde': 'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-comedero-colgante-verde_pemrps.png',
  'ave-comedero-mani-marron':    'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-comedero-mani-marron_fuljb7.png',
  'ave-jaula-decorativa-negra':  'https://res.cloudinary.com/dmagqy229/image/upload/v1779066911/ave-jaula-decorativa-negra_qwd5ud.png',
};

const img = (k: string) => C[k] || undefined;

export async function seedAccesoriosAve({ seedProduct, wid, cats, A, col, ani }: SeedContext) {
  console.log('Creando accesorios aves...');

  await seedProduct({
    name: 'Jaula Redonda para Aves', slug: 'jaula-redonda-ave',
    description: 'Jaula redonda de metal con base sólida y puerta lateral. Ideal para canarios y cotorras.',
    categoryId: cats.accesoriosA, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'AVE-JAULA-REDONDA-DORADA', price: 9500, attributeValueIds: [col.dorado,   ani.ave], url: img('ave-jaula-redonda-dorada') },
      { sku: 'AVE-JAULA-REDONDA-PLATA',  price: 8000, attributeValueIds: [col.plateado, ani.ave], url: img('ave-jaula-redonda-plata')  },
      { sku: 'AVE-JAULA-REDONDA-GRIS',   price: 7500, attributeValueIds: [col.gris,     ani.ave], url: img('ave-jaula-redonda-gris')   },
    ],
  });

  await seedProduct({
    name: 'Comedero Colgante para Aves', slug: 'comedero-colgante-ave',
    description: 'Comedero colgante con tolva para semillas. Ideal para jardines y exteriores.',
    categoryId: cats.accesoriosA, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'AVE-COMEDERO-COLGANTE-GRIS',  price: 3200, attributeValueIds: [col.gris,  ani.ave], url: img('ave-comedero-colgante-gris')  },
      { sku: 'AVE-COMEDERO-COLGANTE-VERDE', price: 3200, attributeValueIds: [col.verde, ani.ave], url: img('ave-comedero-colgante-verde') },
    ],
  });

  await seedProduct({
    name: 'Comedero de Maní para Aves', slug: 'comedero-mani-ave',
    description: 'Comedero colgante con rejilla para maníes. Atrae pájaros silvestres al jardín.',
    categoryId: cats.accesoriosA, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'AVE-COMEDERO-MANI-MARRON', price: 2800, attributeValueIds: [col.marron, ani.ave], url: img('ave-comedero-mani-marron') },
    ],
  });

  await seedProduct({
    name: 'Jaula Decorativa para Aves', slug: 'jaula-decorativa-ave',
    description: 'Jaula de metal con detalles ornamentales. Diseño premium para exhibición.',
    categoryId: cats.accesoriosA, warehouseId: wid, attributeIds: [A.color, A.animal],
    variants: [
      { sku: 'AVE-JAULA-DECORATIVA-NEGRA', price: 14000, attributeValueIds: [col.negro, ani.ave], url: img('ave-jaula-decorativa-negra') },
    ],
  });
}
