import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../model/auth.service';
import { AuthData } from '../model/auth.types';
import { ERR_MSG_LOGIN, ERR_MSG_PASS } from '../model/auth.constants';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: '../register/register-form.scss',
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly ERR_MSG_LOGIN = ERR_MSG_LOGIN;
  readonly ERR_MSG_PASS = ERR_MSG_PASS;
  readonly errorMessage = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z]{2,}$/)]],
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

// import { Component, OnInit, inject, signal } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../model/auth.service';
// import { AuthData } from '../model/auth.types';
// import { ERR_MSG_LOGIN, ERR_MSG_PASS } from '../model/auth.constants';
// // import { CurrentUser } from '../../../model/auth.session';

// @Component({
//   selector: 'app-login-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './login-form.html',
//   styleUrl: './login-form.scss',
// })
// export class LoginFormComponent implements OnInit {
//   private readonly fb = inject(FormBuilder);
//   private readonly router = inject(Router);
//   private readonly authService = inject(AuthService);

//   loginForm!: FormGroup;
//   fieldErrors: Record<string, string> = {};
//   readonly errorMessage = signal('');

//   ngOnInit(): void {
//     // CurrentUser.restoreInstance();
//     this.loginForm = this.fb.group({
//       username: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z]{2,}$/)]],
//       password: ['', [Validators.required, Validators.pattern(/^(?=.*[^A-Za-z0-9]).{6,}$/)]],
//     });
//   }

//   isValid(controlName: string): boolean {
//     const control = this.loginForm.get(controlName);
//     return !!control?.valid && control?.touched;
//   }

//   isInvalid(controlName: string): boolean {
//     const control = this.loginForm.get(controlName);
//     return !!control?.invalid && control?.touched;
//   }

//   markTouched(controlName: string): void {
//     const control = this.loginForm.get(controlName);
//     if (!control) return;

//     control.markAsTouched();

//     if (control.invalid) {
//       // const value = control.value?.trim();
//       switch (controlName) {
//         case 'username':
//           this.fieldErrors['username'] = ERR_MSG_LOGIN;
//           break;
//         case 'password':
//           this.fieldErrors['password'] = ERR_MSG_PASS;
//           break;
//       }
//     } else {
//       this.fieldErrors[controlName] = '';
//     }
//   }

//   clearError(controlName: string): void {
//     this.fieldErrors[controlName] = '';
//   }

//   async onSubmit(): Promise<void> {
//     if (this.loginForm.invalid) return;

//     const request: AuthData = {
//       login: this.loginForm.value.username.trim(),
//       password: this.loginForm.value.password.trim(),
//     };

//     this.errorMessage.set('');

//     this.authService.authRequest<AuthData>(request, 'login').subscribe({
//       next: (result) => {
//         if (result.message === 'Login successful') {
//           // new CurrentUser(result.data);
//           this.router.navigate(['/menu']);
//         } else {
//           this.errorMessage.set(result.error ?? 'Login error');
//         }
//       },
//       error: (err) => {
//         this.errorMessage.set(err.message);
//       },
//     });
//   }
// }
