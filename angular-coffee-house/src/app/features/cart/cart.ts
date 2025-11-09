import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { AuthService } from '../auth/model/auth.service';
import { CartItem } from '../../core/models/product.model';
import { RegisterData } from '../auth/model/auth.types';
import { ERROR_500_MSG, ORDER_SUCCESS_MSG } from '../../core/constants/messages';
import { OrderData } from '../../core/types/api.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  cartItems = signal<CartItem[]>([]);
  user: RegisterData | null = null;
  isLoading = signal(false);
  notificationMessage = signal<string>('');
  userAddress = signal('');
  paymentMethod = signal('');

  isAuthenticated = () => {
    return this.authService.checkAuth();
  };

  totalPrice = computed(() => {
    const total = this.cartItems().reduce(
      (acc, item) => acc + Number(item.price || item.discountPrice),
      0,
    );
    return `${total.toFixed(2)}`;
  });

  discountPrice = computed(() => {
    const total = this.cartItems().reduce(
      (acc, item) => acc + Number(item.discountPrice || item.price),
      0,
    );
    return `${total.toFixed(2)}`;
  });

  showBothPrices = computed(() => {
    return this.totalPrice() !== this.discountPrice() && Number(this.discountPrice()) > 0;
  });

  displayPrice = computed(() => {
    if (this.cartItems().length === 0) return '0.00';
    return this.totalPrice();
  });

  async ngOnInit() {
    this.user = await this.cartService.loadUserProfile();
    await this.loadCartItems();
    if (this.user) {
      const addressParts = [
        this.user.city,
        this.user.street,
        this.user.houseNumber.toString(),
      ].filter((part) => part && part.trim() !== '');
      this.userAddress.set(addressParts.join(', '));

      this.paymentMethod.set(
        this.user.paymentMethod.charAt(0).toUpperCase() + this.user.paymentMethod.slice(1),
      );
    }
  }

  private async loadCartItems() {
    let cartItems = localStorage.getItem('CoffeeHouseCartItems-' + this.user?.login || '');
    if (!this.user) cartItems = localStorage.getItem('CoffeeHouseCartItems-');
    this.cartItems.set(cartItems ? JSON.parse(cartItems) : []);
  }

  getAdditivesText(additives: string[] | undefined): string {
    return additives && additives.length > 0 ? ', ' + additives.join(', ') : '';
  }

  removeItem(item: CartItem) {
    const currentItems = this.cartItems();
    const index = currentItems.indexOf(item);
    const login = this.user?.login || '';

    if (index !== -1) {
      const newItems = [...currentItems];
      newItems.splice(index, 1);
      this.cartItems.set(newItems);
      localStorage.setItem('CoffeeHouseCartItems-' + login, JSON.stringify(newItems));
      this.cartService.updateCartCount();
    }
  }

  async confirmOrder() {
    if (this.cartItems().length === 0) return;
    const login = this.user?.login || '';

    this.isLoading.set(true);

    try {
      const orderData = this.transformToOrderData(this.cartItems());
      await firstValueFrom(this.cartService.postOrder(orderData));

      this.cartItems.set([]);
      localStorage.removeItem('CoffeeHouseCartItems-' + login);
      this.cartService.cartCount.set('');

      this.notificationMessage.set(ORDER_SUCCESS_MSG);
    } catch {
      this.notificationMessage.set(ERROR_500_MSG);
    } finally {
      this.isLoading.set(false);
    }
  }

  private transformToOrderData(items: CartItem[]): OrderData {
    return {
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        additives: item.additives,
        quantity: item.quantity,
      })),
      totalPrice: Number(this.totalPrice()),
    };
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
