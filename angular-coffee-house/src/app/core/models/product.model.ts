export type BaseProduct = {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
};

export type Product = BaseProduct & {
  sizes: Sizes;
  additives: Additives[];
};

export type FavoritesProduct = BaseProduct;

export type Sizes = Record<DrinkSizeKey, SizeOption>;

export enum DrinkSizeKey {
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
  XXL = 'xxl',
  XXXL = 'xxxl',
}

export type SizeOption = {
  size: string;
  price: string;
  discountPrice?: string;
};

export type Additives = {
  name: string;
  price: string;
  discountPrice?: string;
};
