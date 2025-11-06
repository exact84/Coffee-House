import { Component } from '@angular/core';
import { LoginFormComponent } from '../../features/auth/login/login-form';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  standalone: true,
  imports: [LoginFormComponent],
})
export class LoginPage {}
