export interface CardItem {
  image?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: Sizes;
  additives: {
    name: string;
    price: string;
  }[];
}

type Sizes = Record<DrinkSizeKey, SizeOption>;

type DrinkSizeKey = 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';

type SizeOption = {
  size: string;
  price: string;
};
