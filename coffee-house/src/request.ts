import { BASE_URL } from './consts';
import { isApiResponse } from './typeGuard';
import { ApiResponse, ApiResponseItem } from './responseTypes';

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
  const res = await response.json();

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
  const res = await response.json();

  // if (!isApiResponse<T>(res)) {
  //   throw new Error('Invalid API response structure');
  // }
  return res;
}
