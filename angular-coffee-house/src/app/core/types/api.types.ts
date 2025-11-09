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
