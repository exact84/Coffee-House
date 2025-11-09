import { inject, Injectable } from '@angular/core';
import { ApiResponse, ApiResponseItem } from '../../../core/types/api.types';
import { isApiResponse, isApiResponseItem } from '../../../core/typeGuards/typeGuard';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiConfigService } from '../../../shared/config/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfigService);

  productsRequest<T>(): Observable<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/products`;

    return this.http
      .get<ApiResponse<T>>(url, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        map((response) => {
          if (!isApiResponse(response)) {
            throw new Error('Invalid API response structure');
          }
          return response;
        }),
        catchError((error) => {
          const body = error?.error;
          let message = Array.isArray(body?.message)
            ? body.message[0]
            : body?.message || body?.error || 'Network error';

          return throwError(() => new Error(message));
        }),
      );
  }

  productsRequestByID<T>(id: string): Observable<T> {
    const url = `${this.config.baseUrl}/products/${id}`;
    return this.http
      .get<ApiResponseItem<T>>(url, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        map((response) => {
          if (!isApiResponseItem(response)) {
            throw new Error('Invalid API response structure');
          }
          return response.data;
        }),
        catchError((error) => {
          const body = error?.error;
          let message = Array.isArray(body?.message)
            ? body.message[0]
            : body?.message || body?.error || 'Network error';

          return throwError(() => new Error(message));
        }),
      );
  }
}
