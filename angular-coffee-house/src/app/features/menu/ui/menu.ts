import { Component, OnInit, signal, computed, effect, inject, HostListener } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
// import { CurrentUser } from '../../core/models/current-user.model';
// import { ModalService } from '../../core/services/modal.service';
import { Product, ProductType } from '../../../core/models/product.model';
import { IMAGE_MAP } from '../../../core/constants/image-map';
import { MenuService } from '../model/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit {
  private menuService = inject(MenuService);
  // private modal = inject(ModalService);
  readonly isDesktop = signal(window.innerWidth > 768);
  private readonly allItems = signal<Product[]>([]);
  readonly category = signal<ProductType>('coffee');
  readonly visibleCount = signal(4);
  readonly isError = signal(false);
  readonly isLoading = signal(false);
  readonly tabs: ProductType[] = ['coffee', 'tea', 'dessert'];

  // при изменении категории или allItems обновляем filteredItems
  readonly filteredItems = computed(() => {
    const cat = this.category();
    return this.allItems()
      .filter((item) => item.category === cat)
      .map((item) => ({
        ...item,
        image: `assets/img/menu/${IMAGE_MAP[item.name as keyof typeof IMAGE_MAP] || 'coffee.png'}`,
      }));
  });

  readonly visibleItems = computed(() => this.filteredItems().slice(0, this.visibleCount()));
  columns = '';

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
        this.columns = 'repeat(auto-fill, minmax(310px, 1fr))';
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
    console.log('Модалка ', id);
    // this.modal.open(id);
  }
}
