export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
}

export interface CartItem {
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
}

export interface OrderItem {
  productId: number;
  size: string;
  additives: string[];
  quantity: number;
}

export interface OrderData {
  items: OrderItem[];
  totalPrice: number;
}

export interface ApiResponse<T> {
  data: T[];
  message: string;
  error: string;
}

export interface ApiResponseItem<T> {
  data: T;
  message: string;
  error: string;
}
