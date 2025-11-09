import { Component } from '@angular/core';
import { RegisterFormComponent } from '../../features/auth/register/register-form';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  standalone: true,
  imports: [RegisterFormComponent],
})
export class RegisterPage {}
