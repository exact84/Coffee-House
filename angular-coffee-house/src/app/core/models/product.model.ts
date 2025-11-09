export type ProductType = 'coffee' | 'tea' | 'dessert';

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

export interface CardItem {
  image?: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  sizes: Sizes;
  additives: Additives[];
}

export type CartItem = {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
  size: string;
  additives: string[];
  quantity: number;
  totalPrice: string;
};

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
