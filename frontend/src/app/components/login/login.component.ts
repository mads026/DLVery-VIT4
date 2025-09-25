import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';
import { PasswordValidator } from '../../validators/password.validator';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PasswordStrengthComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Error message constants
  private readonly PASSWORD_ERROR_MESSAGES: { [key: string]: string } = {
    'minLength': 'Password must be at least 8 characters long',
    'maxLength': 'Password must not exceed 128 characters',
    'uppercase': 'Password must contain at least one uppercase letter',
    'lowercase': 'Password must contain at least one lowercase letter',
    'digit': 'Password must contain at least one digit',
    'specialChar': 'Password must contain at least one special character',
    'commonPassword': 'Password is too common and easily guessable',
    'repeatedChars': 'Password cannot contain more than 3 consecutive identical characters',
    'sequentialChars': 'Password cannot contain 3 or more sequential characters'
  };

  private readonly AUTH_ERROR_MESSAGES: { [key: string]: string } = {
    '400_Login': 'Login failed. Please check your information.',
    '400_Registration': 'Registration failed. Please check your information.',
    '401_Login': 'Invalid username or password',
    '401_Registration': 'Invalid username or password',
    '403_Login': 'Access denied. Please check your credentials.',
    '403_Registration': 'Access denied. Please check your credentials.',
    '409_Login': 'Username or email already exists',
    '409_Registration': 'Username or email already exists',
    '0_Login': 'Unable to connect to server. Please try again.',
    '0_Registration': 'Unable to connect to server. Please try again.'
  };

  inventoryCredentials: LoginRequest = {
    username: '',
    password: ''
  };

  registerData: RegisterRequest = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  };

  loading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  showRegisterForm = false;
  passwordErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for verification status in query parameters
    this.route.queryParams.subscribe(params => {
      const messageMap: { [key: string]: string } = {
        'verified=true': 'Email verified successfully! You can now login.',
        'error=invalid_token': 'Invalid or expired verification token. Please try again.',
        'error=verification_failed': 'Email verification failed. Please try again.',
        'error=auth_failed': 'Google authentication failed. Please try again.'
      };

      const key = params['verified'] === 'true' ? 'verified=true' : `error=${params['error']}`;
      this.errorMessage = messageMap[key] || '';
    });
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
    this.inventoryCredentials = { username: '', password: '' };
    this.registerData = { username: '', password: '', confirmPassword: '', email: '', fullName: '' };
  }

  private validateLoginCredentials(): string | null {
    if (!this.inventoryCredentials.username || !this.inventoryCredentials.password) {
      return 'Please enter both username and password';
    }

    if (this.inventoryCredentials.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (this.inventoryCredentials.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return null;
  }

  private validateRegistrationData(): string | null {
    if (!this.registerData.username || !this.registerData.password ||
        !this.registerData.confirmPassword || !this.registerData.email || !this.registerData.fullName) {
      return 'Please fill in all fields';
    }

    if (this.registerData.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    // Validate password using our custom validator
    this.onPasswordChange();
    if (this.passwordErrors.length > 0) {
      return this.passwordErrors[0]; // Show first error
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      return 'Passwords do not match';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  private handleAuthError(error: any, operation: string): string {
    console.error(`${operation} error:`, error);

    // Handle field-specific validation errors
    if (error.status === 400 && error.error && typeof error.error === 'object' && !error.error.message) {
      const fieldErrors = Object.values(error.error);
      return fieldErrors[0] as string || 'Invalid input';
    }

    // Use flattened error message lookup
    const errorKey = `${error.status}_${operation}`;
    return this.AUTH_ERROR_MESSAGES[errorKey] || error.error?.message || `${operation} failed. Please try again.`;
  }

  private navigateBasedOnRole(role: string): void {
    // Add a small delay for better UX
    setTimeout(() => {
      if (role === 'DL_TEAM') {
        this.router.navigate(['/delivery/dashboard']);
      } else {
        this.router.navigate(['/inventory']);
      }
    }, 500);
  }

  onInventoryLogin(): void {
    // Trim whitespace and validate
    this.inventoryCredentials.username = this.inventoryCredentials.username.trim();
    this.inventoryCredentials.password = this.inventoryCredentials.password.trim();

    const validationError = this.validateLoginCredentials();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.loginInventoryTeam(this.inventoryCredentials).subscribe({
       next: (response) => {
         if (response.token) {
           this.authService.setAuthData(response);
           this.navigateBasedOnRole(response.role);
         } else {
           this.errorMessage = response.message || 'Login failed';
           this.loading = false;
         }
       },
      error: (error) => {
        this.errorMessage = this.handleAuthError(error, 'Login');
        this.loading = false;
      }
    });
  }

  onPasswordChange(): void {
    this.passwordErrors = [];

    if (this.registerData.password) {
      const errors = PasswordValidator.strong()(this.registerData as any);
      if (errors) {
        Object.keys(errors).forEach(errorKey => {
          const message = this.PASSWORD_ERROR_MESSAGES[errorKey];
          if (message) {
            this.passwordErrors.push(message);
          }
        });
      }
    }
  }

  onInventoryRegister(): void {
    // Trim whitespace and validate
    this.registerData.username = this.registerData.username.trim();
    this.registerData.email = this.registerData.email.trim();
    this.registerData.fullName = this.registerData.fullName.trim();

    const validationError = this.validateRegistrationData();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.registerInventoryTeam(this.registerData).subscribe({
       next: (response) => {
         if (response.token) {
           this.authService.setAuthData(response);
           this.navigateBasedOnRole(response.role);
         } else {
           this.errorMessage = response.message || 'Registration failed';
           this.loading = false;
         }
       },
      error: (error) => {
        this.errorMessage = this.handleAuthError(error, 'Registration');
        this.loading = false;
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
