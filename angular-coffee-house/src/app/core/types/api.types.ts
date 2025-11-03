export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
}

export interface User {
  id: number;
  login: string;
  city: string;
  street: string;
  houseNumber: number;
  paymentMethod: string;
  createdAt: string;
}

export interface UserData {
  access_token: string;
  user: User;
}

export interface RegisterData {
  login: string;
  password: string;
  confirmPassword: string;
  city: string;
  street: string;
  houseNumber: number;
  paymentMethod: string;
}

export interface AuthData {
  login: string;
  password: string;
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

export interface AuthResponse {
  data: UserData;
  message: string;
  error: string;
}
