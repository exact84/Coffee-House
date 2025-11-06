import { Routes } from '@angular/router';
import { MenuPage } from './pages/menu-page/menu-page';
import { RegisterPage } from './pages/register-page/register-page';
import { LoginPage } from './pages/login-page/login-page';
import { CartPage } from './pages/cart-page/cart-page';
import { HomePage } from './pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'menu', component: MenuPage },
  { path: 'cart', component: CartPage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: '**', redirectTo: '' },
];
