import { BASE_URL } from './consts';
import { isApiResponse, isApiResponseItem } from './typeGuard';
import { ApiResponse, ApiResponseItem, AuthResponse, UserData } from './responseTypes';

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
    console.log('Ответ - Ошибка', responseBody);
    throw new Error(responseBody.error || 'Network response was not ok');
  }

  if (!isApiResponseItem<AuthResponse>(responseBody)) {
    console.log('Ответ Регистрации - Неверный формат', responseBody);
    throw new Error('Invalid API response structure');
  }
  return responseBody;
}

// export async function register<AuthResponse>(
//   registerData: RegisterData
// ): Promise<ApiResponseItem<AuthResponse>> {
//   const response = await fetch(BASE_URL + '/auth/register', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(registerData),
//   });
//   const responseBody = await response.json();
//   if (!response.ok) {
//     console.log('Ответ Регистрации - Ошибка', responseBody);
//     throw new Error(responseBody.error || 'Network response was not ok');
//   }

//   if (!isApiResponseItem<AuthResponse>(responseBody)) {
//     console.log('Ответ Регистрации - Неверный формат', responseBody);
//     throw new Error('Invalid API response structure');
//   }
//   return responseBody;
// }
