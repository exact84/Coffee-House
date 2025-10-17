export interface CardItem {
  image?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: Sizes;
  additives: {
    name: string;
    'add-price': string;
  }[];
}

type Sizes = Record<DrinkSizeKey, SizeOption>;

type DrinkSizeKey = 's' | 'm' | 'l';

type SizeOption = {
  size: string;
  'add-price': string;
};
