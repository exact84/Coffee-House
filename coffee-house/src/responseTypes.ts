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

export type AuthResponse = {
  data: UserData;
  message: string;
  error: string;
};

export type UserData = {
  access_token: string;
  user: User;
};

export type User = {
  id: number;
  login: string;
  city: string;
  street: string;
  houseNumber: number;
  paymentMethod: string;
  createdAt: string;
};

export type RegisterData = {
  login: string;
  password: string;
  confirmPassword: string;
  city: string;
  street: string;
  houseNumber: number;
  paymentMethod: string;
};

export type AuthData = {
  login: string;
  password: string;
};
