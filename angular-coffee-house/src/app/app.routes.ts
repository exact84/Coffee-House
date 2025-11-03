import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Menu } from './features/menu/components/menu/menu';
import { Cart } from './features/cart/cart';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'menu', component: Menu },
  { path: 'cart', component: Cart },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
