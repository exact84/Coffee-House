import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/model/auth.service';
import { CartService } from '../../../features/cart/cart.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);
  cartCountSignal = this.cartService.cartCount;
  userLogin = '';
  isMenuOpen = signal(false);

  isAuthenticated = () => {
    return this.authService.checkAuth();
  };

  logout(event: Event) {
    event.preventDefault();
    localStorage.removeItem('CoffeeHouseUser');
    this.cartService.userLogin.set('');
    this.cartService.updateCartCount();
    this.router.navigate(['/menu']);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
    this.updateBodyScroll();
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (this.isMenuOpen()) {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    }
  }

  onMenuClick(): void {
    this.closeMenu();
  }
}
