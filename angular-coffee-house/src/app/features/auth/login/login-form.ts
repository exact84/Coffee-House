import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../model/auth.service';
import { AuthData } from '../model/auth.types';
import { ERR_MSG_LOGIN, ERR_MSG_PASS } from '../model/auth.constants';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: '../auth.scss',
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly ERR_MSG_LOGIN = ERR_MSG_LOGIN;
  readonly ERR_MSG_PASS = ERR_MSG_PASS;
  readonly errorMessage = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3,}$/)]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[^A-Za-z0-9]).{6,}$/)]],
  });

  onFocus(field: string): void {
    this.form.get(field)?.markAsUntouched();
    this.errorMessage.set('');
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data: AuthData = {
      login: this.form.value.username!.trim(),
      password: this.form.value.password!.trim(),
    };

    this.errorMessage.set('');

    this.authService.authRequest<AuthData>(data, 'login').subscribe({
      next: (result) => {
        if (result.message === 'Login successful') {
          this.cartService.loadUserProfile();
          this.router.navigate(['/menu']);
        } else {
          this.errorMessage.set(result.error ?? 'Login error');
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      },
    });
  }
}
