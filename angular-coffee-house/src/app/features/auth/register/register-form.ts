import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../model/auth.service';
import { AuthData, RegisterData } from '../model/auth.types';
import { streetsByCity, cities } from '../model/auth.constants';
import { toSignal } from '@angular/core/rxjs-interop';
import { ERR_MSG_LOGIN, ERR_MSG_PASS } from '../model/auth.constants';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: '../auth.scss',
})
export class RegisterFormComponent {
  @ViewChildren('formInput', { read: ElementRef }) inputs!: QueryList<ElementRef>;
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly ERR_MSG_LOGIN = ERR_MSG_LOGIN;
  readonly ERR_MSG_PASS = ERR_MSG_PASS;

  cities = cities;
  errorMessage = signal('');
  streets = computed(() => {
    const city = this.city();
    return city ? streetsByCity[city] || [] : [];
  });

  constructor() {
    effect(() => {
      //  clear street field
      if (this.city()) {
        this.form.get('street')?.setValue('');
      }
    });
  }

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z]{2,}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[^A-Za-z0-9]).{6,}$/)]],
      confirmPassword: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', [Validators.required, Validators.min(2)]],
      paymentMethod: ['cash', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );
  city = toSignal(this.form.get('city')!.valueChanges, { initialValue: '' });

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  get passwordMismatch(): boolean {
    return !!(this.form.errors?.['mismatch'] && this.form.get('confirmPassword')?.touched);
  }

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

    const data: RegisterData = {
      login: this.form.value.username!,
      password: this.form.value.password!,
      confirmPassword: this.form.value.confirmPassword!,
      city: this.form.value.city!,
      street: this.form.value.street!,
      houseNumber: Number(this.form.value.houseNumber),
      paymentMethod: this.form.value.paymentMethod!,
    };

    this.authService.authRequest<AuthData>(data, 'register').subscribe({
      next: (result) => {
        if (result.message === 'User registered successfully') {
          this.form.reset();
          this.form.get('paymentMethod')?.setValue('cash');
          this.cartService.loadUserProfile();
          this.router.navigate(['/menu']);
        } else {
          this.errorMessage.set(result.error ?? 'Registration error');
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      },
    });
  }
}
