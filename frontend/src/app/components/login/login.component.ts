import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest, RegisterRequest, AuthResponse } from '../../services/auth.service';
import { ValidationService } from '../../services/validation.service';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';
import { ModernInputComponent } from '../../shared/components/modern-input/modern-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PasswordStrengthComponent,
    ModernInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly AUTH_ERROR_MESSAGES: { [key: string]: string } = {
    '400': 'Please check your information.',
    '401': 'Invalid username or password',
    '403': 'Access denied. Please check your credentials.',
    '409': 'Username or email already exists',
    '0': 'Unable to connect to server. Please try again.'
  };

  loginForm: FormGroup;
  registerForm: FormGroup;

  loading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  showRegisterForm = false;
  passwordErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = this.getStatusMessage(params);
    });
  }

  private getStatusMessage(params: any): string {
    const messages: { [key: string]: string } = {
      'verified': 'Email verified successfully! You can now login.',
      'error=invalid_token': 'Invalid or expired verification token. Please try again.',
      'error=verification_failed': 'Email verification failed. Please try again.',
      'error=auth_failed': 'Google authentication failed. Please try again.',
      'message=verification_sent': params['messageText'] || 'Verification email sent! Please check your inbox.'
    };

    if (params['verified'] === 'true') {
      return messages['verified'];
    }

    const key = params['error'] ? `error=${params['error']}` : `message=${params['message']}`;
    return messages[key] || '';
  }

  private setLoadingState(loading: boolean): void {
    this.loading = loading;
    if (!loading) {
      this.errorMessage = '';
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.token) {
      this.authService.setAuthData(response);
      this.navigateBasedOnRole(response.role);
    } else {
      this.errorMessage = response.message || 'Authentication failed';
      this.setLoadingState(false);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  toggleForm(): void {
    this.showRegisterForm = !this.showRegisterForm;
    this.errorMessage = '';
    this.passwordErrors = [];
    this.resetForms();
  }

  private resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset();
  }

  private validateLoginCredentials(): string | null {
    const formValue = this.loginForm.value;
    return this.validationService.validateLoginCredentials(formValue);
  }

  private validateRegistrationData(): string | null {
    const formValue = this.registerForm.value;
    const validation = this.validationService.validateRegistrationData(formValue);
    this.passwordErrors = validation.passwordErrors;
    return validation.error;
  }

  private handleAuthError(error: any): string {
    console.error('Auth error:', error);

    // Handle field-specific validation errors
    if (error.status === 400 && error.error && typeof error.error === 'object' && !error.error.message) {
      const fieldErrors = Object.values(error.error);
      return fieldErrors[0] as string || 'Invalid input';
    }

    // Use simplified error message lookup
    const errorKey = error.status?.toString() || '0';
    return this.AUTH_ERROR_MESSAGES[errorKey] || error.error?.message || 'Authentication failed. Please try again.';
  }

  private navigateBasedOnRole(role: string): void {
    const routes = {
      'DL_TEAM': '/delivery/dashboard',
      'INV_TEAM': '/inventory'
    };

    setTimeout(() => {
      this.router.navigate([routes[role as keyof typeof routes] || '/inventory']);
    }, 500);
  }

  private navigateToLoginWithError(error: string): void {
    this.router.navigate(['/login'], {
      queryParams: { error }
    });
  }

  onInventoryLogin(): void {
    if (!this.loginForm.valid) {
      this.errorMessage = this.validateLoginCredentials() || 'Please fill in all required fields';
      return;
    }

    this.setLoadingState(true);
    const formValue = this.loginForm.value;

    this.authService.loginInventoryTeam({
      username: formValue.username?.trim() || '',
      password: formValue.password?.trim() || ''
    }).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (error) => {
        this.errorMessage = this.handleAuthError(error);
        this.setLoadingState(false);
      }
    });
  }

  onPasswordChange(): void {
    const password = this.registerForm.get('password')?.value || '';
    this.passwordErrors = this.validationService.validatePassword(password);
  }

  onInventoryRegister(): void {
    if (!this.registerForm.valid) {
      this.errorMessage = this.validateRegistrationData() || 'Please fill in all required fields';
      return;
    }

    this.setLoadingState(true);
    const formValue = this.registerForm.value;

    this.authService.registerInventoryTeam({
      username: formValue.username?.trim() || '',
      email: formValue.email?.trim() || '',
      fullName: formValue.fullName?.trim() || '',
      password: formValue.password || '',
      confirmPassword: formValue.confirmPassword || ''
    }).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (error) => {
        this.errorMessage = this.handleAuthError(error);
        this.setLoadingState(false);
      }
    });
  }

  onDeliveryLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    // Add a small delay to show loading state
    setTimeout(() => {
      this.authService.loginDeliveryTeam();
    }, 200);
  }
}
