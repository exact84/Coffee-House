import { Component } from '@angular/core';
import { CartComponent } from '../../features/cart/cart';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.html',
  standalone: true,
  imports: [CartComponent],
})
export class CartPage {}
