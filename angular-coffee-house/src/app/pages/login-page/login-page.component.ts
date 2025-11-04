import { Component } from '@angular/core';
import { LoginFormComponent } from '../../features/auth/login/login-form';
import { Footer } from '../../core/components/footer/footer';
import { Header } from '../../core/components/header/header';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  standalone: true,
  imports: [LoginFormComponent, Header, Footer],
})
export class LoginPageComponent {}
