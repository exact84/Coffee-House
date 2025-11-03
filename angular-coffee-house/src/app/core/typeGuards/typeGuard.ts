import { ApiResponse, ApiResponseItem, UserData } from '../types/api.types';

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  if (typeof obj !== 'object' || obj === null) return false;
  const res = obj as Partial<ApiResponse<T>>;
  return Array.isArray(res.data);
}

export function isApiResponseItem<T>(obj: unknown): obj is ApiResponseItem<T> {
  if (typeof obj !== 'object' || obj === null) return false;
  const res = obj as Partial<ApiResponseItem<T>>;
  return typeof res.data === 'object' && !Array.isArray(res.data);
}

export function isUserData(obj: unknown): obj is UserData {
  if (typeof obj !== 'object' || obj === null) return false;
  const user = obj as Partial<UserData>;
  return typeof user.user?.id === 'number' && typeof user.user?.login === 'string';
}
