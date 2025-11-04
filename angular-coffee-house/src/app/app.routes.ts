import { Routes } from '@angular/router';
import { Home } from './features/home/home';
// import { Menu } from './features/menu/components/menu/menu';
import { Cart } from './features/cart/cart';
import { LoginFormComponent } from './features/auth/login/login-form';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  // { path: 'menu', component: Menu },
  { path: 'cart', component: Cart },
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
