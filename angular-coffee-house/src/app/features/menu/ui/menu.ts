import {
  Component,
  OnInit,
  signal,
  computed,
  effect,
  inject,
  HostListener,
  ViewChild,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Product, ProductType } from '../../../core/models/product.model';
import { IMAGE_MAP, PLACEHOLDER_IMAGE } from '../../../core/constants/image-map';
import { MenuService } from '../model/menu.service';
import { MenuModalComponent } from './menu-modal/menu-modal';
import { ERROR_500_MSG } from '../../../core/constants/messages';
import { AuthService } from '../../auth/model/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TitleCasePipe, MenuModalComponent],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit {
  @ViewChild(MenuModalComponent) modal!: MenuModalComponent;
  private menuService = inject(MenuService);
  authService = inject(AuthService);
  readonly isDesktop = signal(window.innerWidth > 768);
  private readonly allItems = signal<Product[]>([]);
  readonly category = signal<ProductType>('coffee');
  readonly visibleCount = signal(4);
  readonly isError = signal(false);
  readonly isLoading = signal(false);
  readonly modalErrorMessage = signal('');
  readonly tabs: ProductType[] = ['coffee', 'tea', 'dessert'];
  readonly error_500_msg = ERROR_500_MSG;
  gridColumns = '';

  // при изменении категории или allItems обновляем filteredItems
  readonly filteredItems = computed(() => {
    const cat = this.category();
    return this.allItems()
      .filter((item) => item.category === cat)
      .map((item) => ({
        ...item,
        image: `assets/img/menu/${IMAGE_MAP[item.name as keyof typeof IMAGE_MAP] || PLACEHOLDER_IMAGE}`,
      }));
  });

  readonly visibleItems = computed(() => this.filteredItems().slice(0, this.visibleCount()));

  constructor() {
    effect(() => {
      if (this.isDesktop()) this.visibleCount.set(this.filteredItems().length);
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  @HostListener('window:resize')
  resize() {
    const desktop = window.innerWidth > 768;
    if (desktop !== this.isDesktop()) {
      this.isDesktop.set(desktop);
      if (!desktop) this.visibleCount.set(4);
    }
  }

  private loadProducts() {
    this.isLoading.set(true);
    this.menuService.productsRequest<Product>().subscribe({
      next: (response) => {
        this.allItems.set(response.data);
        this.filterCategory(this.category());
        this.gridColumns = 'repeat(auto-fill, minmax(310px, 1fr))';
        this.isLoading.set(false);
      },
      error: () => {
        this.isError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  filterCategory(cat: ProductType) {
    this.category.set(cat);
  }

  loadMore() {
    this.visibleCount.set(this.filteredItems().length);
  }

  openModal(id: string) {
    this.modalErrorMessage.set('');
    this.modal.open(id).subscribe({
      error: () => {
        this.modalErrorMessage.set(this.error_500_msg);
        window.scrollTo(0, 0);
      },
    });
  }
}
