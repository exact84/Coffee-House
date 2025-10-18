import { ApiResponse } from './responseTypes';

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  if (typeof obj !== 'object' || obj === null) return false;

  const res = obj as Partial<ApiResponse<T>>;
  return Array.isArray(res.data);
}
