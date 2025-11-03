import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/types/api.types';
import { isApiResponse } from '../../core/typeGuards/typeGuard';

@Injectable({
  providedIn: 'root',
})
export class SliderService {
  public async getFavorites<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(environment.apiUrl + url, {
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
}
