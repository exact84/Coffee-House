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

export interface AuthResponse {
  data: UserData;
  message: string;
  error: string;
}
