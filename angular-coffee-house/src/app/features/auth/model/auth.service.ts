import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiConfigService } from '../../../shared/config/api-config.service';
import { RegisterData, UserData } from './auth.types';
import { isApiResponseItem } from '../../../core/typeGuards/typeGuard';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponseItem } from '../../../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfigService);

  authRequest<T>(authData: T, path: string): Observable<ApiResponseItem<UserData>> {
    const url = `${this.config.baseUrl}/auth/${path}`;

    return this.http
      .post<
        ApiResponseItem<UserData>
      >(url, authData, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        map((response) => {
          if (!isApiResponseItem(response)) {
            throw new Error('Invalid API response structure');
          }
          localStorage.setItem('CoffeeHouseUser', response.data.access_token);
          return response;
        }),
        catchError((error) => {
          const body = error?.error;
          let message = Array.isArray(body?.message)
            ? body.message[0]
            : body?.message || body?.error || 'Network error';

          if (message === 'Invalid credentials') {
            message = 'Incorrect login or password';
          }

          return throwError(() => new Error(message));
        }),
      );
  }

  checkAuth(): boolean {
    return !!localStorage.getItem('CoffeeHouseUser');
  }

  getProfile(): Observable<ApiResponseItem<RegisterData>> {
    const url = `${this.config.baseUrl}/auth/profile`;
    const token = localStorage.getItem('CoffeeHouseUser');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<ApiResponseItem<RegisterData>>(url, {
        headers,
      })
      .pipe(
        map((response) => {
          if (!isApiResponseItem(response)) {
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
}
