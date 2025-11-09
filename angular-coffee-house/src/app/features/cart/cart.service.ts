import { inject, Injectable, signal } from '@angular/core';
import { ApiResponseItem } from '../../core/types/api.types';
import { isApiResponseItem } from '../../core/typeGuards/typeGuard';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, map, throwError } from 'rxjs';
import { ApiConfigService } from '../../shared/config/api-config.service';
import { OrderData } from '../../core/types/api.types';
import { AuthService } from '../auth/model/auth.service';
import { RegisterData } from '../auth/model/auth.types';
import { CartItem } from '../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfigService);
  authService = inject(AuthService);
  cartCount = signal('');
  userLogin = signal('');

  constructor() {
    this.init();
  }

  async init() {
    await this.loadUserProfile();
  }

  async loadUserProfile(): Promise<RegisterData | null> {
    let profile: RegisterData | null = null;
    if (!this.authService.checkAuth()) {
      this.updateCartCount();
      return null;
    }
    try {
      const response = await firstValueFrom(this.authService.getProfile());
      profile = response.data;
      this.userLogin.set(profile.login);
      this.updateCartCount();
      return profile;
    } catch {
      this.userLogin.set('');
      console.log('Cannot load user profile');
      localStorage.removeItem('CoffeeHouseUser');
      this.updateCartCount();
      return null;
    }
  }

  addToCart(cartItem: CartItem): void {
    const cartName = 'CoffeeHouseCartItems-' + this.userLogin();
    const cartItems = localStorage.getItem(cartName);
    if (cartItems) {
      const items: CartItem[] = JSON.parse(cartItems);
      if (items.length === 0) {
        cartItem.id = 1;
      } else {
        cartItem.id = items[items.length - 1].id + 1;
      }
      items.push(cartItem);
      localStorage.setItem(cartName, JSON.stringify(items));
      this.cartCount.set(items.length.toString());
      return;
    } else {
      localStorage.setItem(cartName, JSON.stringify([cartItem]));
      this.cartCount.set('1');
    }
  }

  updateCartCount() {
    const cartItems = localStorage.getItem('CoffeeHouseCartItems-' + this.userLogin());
    this.cartCount.set(cartItems ? JSON.parse(cartItems).length.toString() : '0');
    if (this.userLogin() === '' && this.cartCount() === '0') {
      this.cartCount.set('');
    }
  }

  postOrder<T>(order: OrderData): Observable<T> {
    const url = `${this.config.baseUrl}/orders/confirm`;
    return this.http
      .post<ApiResponseItem<T>>(url, order, {
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
