import { Component, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MenuService } from '../../model/menu.service';
import { Additives, CardItem, CartItem, Product } from '../../../../core/models/product.model';
import { IMAGE_MAP, PLACEHOLDER_IMAGE } from '../../../../core/constants/image-map';
import { catchError, map, tap, throwError } from 'rxjs';
import { AuthService } from '../../../auth/model/auth.service';

@Component({
  selector: 'app-menu-modal',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './menu-modal.html',
  styleUrl: './menu-modal.scss',
})
export class MenuModalComponent {
  private menuService = inject(MenuService);
  authService = inject(AuthService);

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
              '/assets/img/menu/' +
              (IMAGE_MAP[currentCard.name as keyof typeof IMAGE_MAP] ?? PLACEHOLDER_IMAGE),
          });
        }
        const firstSize = Object.keys(data.sizes)[0] || null;
        this.selectedSize.set(firstSize);
        this.selectedAdditives.set(new Set());

        this.sizeKeys = Object.keys(data.sizes);
        this.additivesValues = Object.values(data.additives);
        console.log(this.card());
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

  getTotalPrice(): number {
    const card = this.card();
    const selectedSize = this.selectedSize();
    if (!card || !selectedSize) return 0;

    const sizeInfo = card.sizes[selectedSize as keyof typeof card.sizes];
    const sizePrice = parseFloat(sizeInfo.price);
    const discSizePrice = parseFloat(sizeInfo.discountPrice || sizeInfo.price);
    console.log(sizeInfo, sizePrice, discSizePrice);

    let additivesTotal = 0;
    let additivesDiscount = 0;

    Object.values(card.additives).forEach((add) => {
      if (this.selectedAdditives().has(add.name)) {
        additivesTotal += parseFloat(add.price);
        additivesDiscount += parseFloat(add.discountPrice || add.price);
      }
    });

    if (!this.authService.checkAuth()) return sizePrice + additivesTotal;
    return discSizePrice + additivesDiscount;
  }

  addToCart() {
    const card = this.card();
    const selectedSize = this.selectedSize();
    if (!this.card || !this.selectedSize) return;

    const cartItem: CartItem = {
      id: (this.cartItemId += 1),
      productId: this.id,
      name: card?.name || '',
      description: card?.description || '',
      image: card?.image,
      category: card?.category || '',
      size: selectedSize || '',
      additives: Array.from(this.selectedAdditives()),
      price: '',
      discountPrice: '',
      quantity: 1,
      totalPrice: '',
    };

    const total = this.getTotalPrice().toFixed(2);
    if (this.authService.checkAuth()) {
      cartItem.discountPrice = total;
      cartItem.totalPrice = total;
    } else {
      cartItem.price = total;
      cartItem.totalPrice = total;
    }

    this.menuService.addToCart(cartItem);
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
    // показывать ли зачеркнутую цену
    return this.getStrikedPrice() !== this.getTotalPrice(); // && this.authService.checkAuth();
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
}
