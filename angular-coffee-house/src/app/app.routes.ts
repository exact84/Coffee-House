import { Routes } from '@angular/router';
import { Home } from './features/home/home';
// import { Menu } from './features/menu/components/menu/menu';
import { Cart } from './features/cart/cart';
import { RegisterPage } from './pages/register-page/register-page';
import { LoginPage } from './pages/login-page/login-page';

export const routes: Routes = [
  { path: '', component: Home },
  // { path: 'menu', component: Menu },
  { path: 'cart', component: Cart },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: '**', redirectTo: '' },
];
