import type { ImageSourcePropType } from 'react-native';

const productImageSources: Record<string, ImageSourcePropType> = {
  'tui xach.jpg': require('../../../assets/images/products/tui xach.jpg'),
  'mũ lưỡi trai.jpg': require('../../../assets/images/products/mũ lưỡi trai.jpg'),
  'giay sneaker.jpg': require('../../../assets/images/products/giay sneaker.jpg'),
  'balo.jpg': require('../../../assets/images/products/balo.jpg'),
  'Quần jeans ống loe .jpg': require('../../../assets/images/products/Quần jeans ống loe .jpg'),
  'Túi mây.jpg': require('../../../assets/images/products/Túi mây.jpg'),
  'Túi xách tay dáng trống .jpg': require('../../../assets/images/products/Túi xách tay dáng trống .jpg'),
  'images (30).jpg': require('../../../assets/images/products/images (30).jpg'),
  'images.jpg': require('../../../assets/images/products/images.jpg'),
};

const legacyProductImageSources: Record<number, ImageSourcePropType> = {
  1: productImageSources['images (30).jpg'],
  2: productImageSources['giay sneaker.jpg'],
  3: productImageSources['balo.jpg'],
  4: productImageSources['mũ lưỡi trai.jpg'],
  5: productImageSources['tui xach.jpg'],
  6: productImageSources['Quần jeans ống loe .jpg'],
  7: productImageSources['Túi mây.jpg'],
  8: productImageSources['Túi xách tay dáng trống .jpg'],
  9: productImageSources['images (30).jpg'],
  10: productImageSources['images.jpg'],
  11: productImageSources['balo.jpg'],
  12: productImageSources['mũ lưỡi trai.jpg'],
};

export function getProductImageSource(
  imgName: string,
  categoryId: number,
): ImageSourcePropType | undefined {
  if (imgName.startsWith('file://') || imgName.startsWith('http://') || imgName.startsWith('https://')) {
    return { uri: imgName };
  }

  const fileName = imgName.split(/[\\/]/).pop() ?? imgName;
  return (
    productImageSources[fileName] ??
    legacyProductImageSources[categoryId] ??
    productImageSources['images (30).jpg']
  );
}
