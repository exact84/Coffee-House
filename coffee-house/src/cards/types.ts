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

export type CartItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
  size: string;
  'add-price': string;
  quantity: number;
  totalPrice: string;
};
