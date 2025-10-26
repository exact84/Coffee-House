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

type Sizes = Record<DrinkSizeKey, SizeOption>;

type DrinkSizeKey = 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';

type SizeOption = {
  size: string;
  price: string;
  discountPrice?: string;
};

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

export type Additives = {
  name: string;
  price: string;
  discountPrice?: string;
};

export type OrderItem = {
  productId: number;
  size: string;
  additives: string[];
  quantity: number;
};

export type OrderData = {
  items: OrderItem[];
  totalPrice: number;
};
