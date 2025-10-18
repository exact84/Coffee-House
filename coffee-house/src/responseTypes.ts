export interface Products {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
}

export type ApiResponse<T> = {
  data: T[];
  message: string;
  error: string;
};

export type ApiResponseItem<T> = {
  data: T;
  message: string;
  error: string;
};

export type CardItem = {
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
};

type Sizes = Record<DrinkSizeKey, SizeOption>;

type DrinkSizeKey = 's' | 'm' | 'l';

type SizeOption = {
  size: string;
  'add-price': string;
};
