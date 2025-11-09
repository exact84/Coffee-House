import { BASE_URL } from './consts';
import { isApiResponse, isApiResponseItem } from './typeGuard';
import { ApiResponse, ApiResponseItem, AuthResponse, User, UserData } from './responseTypes';
import { OrderData } from './cards/types';

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
  const responseBody: ApiResponseItem<T> = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error || 'Network response was not ok');
  }

  if (!isApiResponseItem<T>(responseBody)) {
    throw new Error('Invalid API response structure');
  }
  return responseBody;
}

export async function authRequest<T>(
  authData: T,
  path: string
): Promise<ApiResponseItem<UserData>> {
  const response = await fetch(BASE_URL + '/auth/' + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authData),
  });

  const responseBody: ApiResponseItem<UserData> = await response.json();
  if (!response.ok) {
    let message = Array.isArray(responseBody.message)
      ? responseBody.message[0]
      : responseBody.message || responseBody.error || 'Network response was not ok';
    if (message === 'Invalid credentials') {
      message = 'Incorrect login or password';
    }

    throw new Error(message);
  }

  if (!isApiResponseItem<AuthResponse>(responseBody)) {
    throw new Error('Invalid API response structure');
  }
  return responseBody;
}

export async function getProfile(): Promise<ApiResponseItem<User>> {
  const token = localStorage.getItem('CoffeeHouseUser');
  const response = await fetch(BASE_URL + '/auth/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });

  const responseBody: ApiResponseItem<User> = await response.json();
  if (!response.ok) {
    throw new Error(responseBody.error || 'Network response was not ok');
  }

  if (!isApiResponseItem<User>(responseBody)) {
    throw new Error('Invalid API response structure');
  }
  return responseBody;
}

export async function postOrder(order: OrderData): Promise<ApiResponseItem<UserData>> {
  const response = await fetch(BASE_URL + '/orders/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  const responseBody: ApiResponseItem<UserData> = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error || 'Network response was not ok');
  }

  if (!isApiResponseItem<AuthResponse>(responseBody)) {
    throw new Error('Invalid API response structure');
  }
  return responseBody;
}
