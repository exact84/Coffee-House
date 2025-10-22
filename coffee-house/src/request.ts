import { BASE_URL } from './consts';
import { isApiResponse } from './typeGuard';
import { ApiResponse, ApiResponseItem, RegisterData } from './responseTypes';

export async function makeRequest<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(BASE_URL + url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const res: ApiResponse<T> = await response.json();

  if (!isApiResponse<T>(res)) {
    throw new Error('Invalid API response structure');
  }
  return res;
}

export async function makeRequestbyID<T>(url: string, id: string): Promise<ApiResponseItem<T>> {
  const response = await fetch(BASE_URL + url + '/' + id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const res: ApiResponseItem<T> = await response.json();

  if (!isApiResponse<T>(res)) {
    throw new Error('Invalid API response structure');
  }
  return res;
}

export async function authenticate<AuthResponse>(
  login: string,
  password: string
): Promise<ApiResponseItem<AuthResponse>> {
  const response = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, password }),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const res: ApiResponseItem<AuthResponse> = await response.json();

  if (!isApiResponse<AuthResponse>(res)) {
    console.log('Ответ Логина', res);
    throw new Error('Invalid API response structure');
  }
  return res;
}

export async function register<AuthResponse>(
  registerData: RegisterData
): Promise<ApiResponseItem<AuthResponse>> {
  const response = await fetch(BASE_URL + '/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });
  if (!response.ok) {
    const responseBody = await response.json();
    console.log('Ответ Регистрации', responseBody);
    throw new Error(responseBody.error || 'Network response was not ok');
  }
  const res: ApiResponseItem<AuthResponse> = await response.json();

  if (!isApiResponse<AuthResponse>(res)) {
    console.log('Ответ Регистрации', res);
    throw new Error('Invalid API response structure');
  }
  return res;
}
