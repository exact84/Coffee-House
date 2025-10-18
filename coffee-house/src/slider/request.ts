import { BASE_URL } from '../consts';
import { isApiResponse } from './typeGuard';
import { ApiResponse } from './types';

export async function makeRequest<T>(): Promise<ApiResponse<T>> {
  const response = await fetch(BASE_URL + '/products/favorites', {
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

// export function makePostRequest(url: string, data: any): Promise<Response> {
//   return fetch(BASE_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });
// }
