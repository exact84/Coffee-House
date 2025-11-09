import { Component, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MenuService } from '../../model/menu.service';
import {
  Additives,
  CardItem,
  CartItem,
  DrinkSizeKey,
  Product,
} from '../../../../core/models/product.model';
import { IMAGE_MAP, PLACEHOLDER_IMAGE } from '../../../../core/constants/image-map';
import { catchError, map, tap, throwError } from 'rxjs';
import { AuthService } from '../../../auth/model/auth.service';
import { CartService } from '../../../cart/cart.service';

@Component({
  selector: 'app-menu-modal',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './menu-modal.html',
  styleUrl: './menu-modal.scss',
})
export class MenuModalComponent {
  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  isOpen = signal(false);
  loading = signal(false);
  card = signal<CardItem | null>(null);
  selectedSize = signal<string | null>(null);
  selectedAdditives = signal<Set<string>>(new Set());
  sizeKeys: string[] = [];
  additivesValues: Additives[] = [];
  id = 0;
  cartItemId = 0;
  notificationMessage = signal<string | null>(null);
  count = 0;
  showCountModal = signal(false);
  showCountModalError = signal(false);

  isAuthenticated = () => {
    return this.authService.checkAuth();
  };

  open(id: string) {
    this.id = Number(id);
    this.isOpen.set(true);
    this.loading.set(true);
    document.documentElement.classList.add('no-scroll');

    return this.menuService.productsRequestByID<Product>(id).pipe(
      tap((data) => {
        this.card.set(data);
        const currentCard = this.card();
        if (currentCard) {
          this.card.set({
            ...currentCard,
            image:
              'assets/img/menu/' +
              (IMAGE_MAP[currentCard.name as keyof typeof IMAGE_MAP] ?? PLACEHOLDER_IMAGE),
          });
        }
        const firstSize = Object.keys(data.sizes)[0] || null;
        this.selectedSize.set(firstSize);
        this.selectedAdditives.set(new Set());

        this.sizeKeys = Object.keys(data.sizes);
        this.additivesValues = Object.values(data.additives);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.close();
        this.loading.set(false);
        return throwError(() => err);
      }),
      map(() => void 0),
    );
  }

  close() {
    this.isOpen.set(false);
    this.showCountModal.set(false);
    document.documentElement.classList.remove('no-scroll');
  }

  toggleAdditive(name: string) {
    const set = new Set(this.selectedAdditives());
    if (set.has(name)) set.delete(name);
    else set.add(name);
    this.selectedAdditives.set(set);
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  getTotalPrice(): [number, number] {
    const card = this.card();
    const selectedSize = this.selectedSize();
    if (!card || !selectedSize) return [0, 0];

    const sizeInfo = card.sizes[selectedSize as keyof typeof card.sizes];
    const sizePrice = parseFloat(sizeInfo.price);
    const discSizePrice = parseFloat(sizeInfo.discountPrice || sizeInfo.price);

    let additivesTotal = 0;
    let additivesDiscount = 0;

    Object.values(card.additives).forEach((add) => {
      if (this.selectedAdditives().has(add.name)) {
        additivesTotal += parseFloat(add.price);
        additivesDiscount += parseFloat(add.discountPrice || add.price);
      }
    });
    return [sizePrice + additivesTotal, discSizePrice + additivesDiscount];
  }

  addToCart() {
    const card = this.card();
    const selectedSize = this.selectedSize();
    if (!card || !selectedSize) return;
    const sizeKey = selectedSize as DrinkSizeKey;
    const sizeOption = card.sizes[sizeKey];

    const cartItem: CartItem = {
      id: (this.cartItemId += 1),
      productId: this.id,
      name: card?.name || '',
      description: card?.description || '',
      image: card?.image,
      category: card?.category || '',
      size: sizeOption.size,
      additives: Array.from(this.selectedAdditives()),
      price: (this.getTotalPrice()[0] * this.count).toFixed(2),
      discountPrice: (this.getTotalPrice()[1] * this.count).toFixed(2),
      quantity: this.count,
      totalPrice: '',
    };

    this.cartService.addToCart(cartItem);
    this.close();
  }

  getSizeDisplayName(size: string): string {
    const card = this.card();
    if (!card || !card.sizes[size as keyof typeof card.sizes]) return '';
    return card.sizes[size as keyof typeof card.sizes].size;
  }

  getSizePrice(size: string): number {
    const card = this.card();
    if (!card || !card.sizes[size as keyof typeof card.sizes]) return 0;
    return parseFloat(card.sizes[size as keyof typeof card.sizes].price);
  }

  getSizeDiscountPrice(size: string): number {
    const card = this.card();
    if (!card || !card.sizes[size as keyof typeof card.sizes]) return 0;
    const sizeInfo = card.sizes[size as keyof typeof card.sizes];
    return parseFloat(sizeInfo.discountPrice || sizeInfo.price);
  }

  showStrikedPrice(): boolean {
    return this.getTotalPrice()[0] !== this.getTotalPrice()[1] && this.isAuthenticated();
  }

  getStrikedPrice(): number {
    const card = this.card();
    const selectedSize = this.selectedSize();
    if (!card || !selectedSize) return 0;

    const sizePrice = this.getSizePrice(selectedSize);

    let additivesTotal = 0;
    this.selectedAdditives().forEach((additiveName) => {
      const additive = this.additivesValues.find((a) => a.name === additiveName);
      if (additive) {
        additivesTotal += parseFloat(additive.price);
      }
    });

    return sizePrice + additivesTotal;
  }

  openCountModal() {
    this.showCountModal.set(true);
  }

  closeCountModal(count = '1') {
    this.count = Number(count) || 1;
    if (this.count > 99) {
      this.showCountModalError.set(true);
      return;
    }
    this.showCountModal.set(false);
    this.addToCart();
  }
}
