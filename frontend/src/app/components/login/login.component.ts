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
      if (params['verified'] === 'true') {
        this.errorMessage = 'Email verified successfully! You can now login.';
      } else if (params['error'] === 'invalid_token') {
        this.errorMessage = 'Invalid or expired verification token. Please try again.';
      } else if (params['error'] === 'verification_failed') {
        this.errorMessage = 'Email verification failed. Please try again.';
      }
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

  onInventoryLogin(): void {
    // Trim whitespace and validate
    this.inventoryCredentials.username = this.inventoryCredentials.username.trim();
    this.inventoryCredentials.password = this.inventoryCredentials.password.trim();

    if (!this.inventoryCredentials.username || !this.inventoryCredentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    if (this.inventoryCredentials.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }

    if (this.inventoryCredentials.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.loginInventoryTeam(this.inventoryCredentials).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.setAuthData(response);
          // Add a small delay for better UX
          setTimeout(() => {
            this.router.navigate(['/inventory/dashboard']);
          }, 500);
        } else {
          this.errorMessage = response.message || 'Login failed';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        
        // Better error message handling
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Please check your credentials.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
        
        this.loading = false;
      }
    });
  }

  onPasswordChange(): void {
    this.passwordErrors = [];
    
    if (this.registerData.password) {
      const errors = PasswordValidator.strong()(this.registerData as any);
      if (errors) {
        // Convert validation errors to user-friendly messages
        if (errors['minLength']) this.passwordErrors.push('Password must be at least 8 characters long');
        if (errors['maxLength']) this.passwordErrors.push('Password must not exceed 128 characters');
        if (errors['uppercase']) this.passwordErrors.push('Password must contain at least one uppercase letter');
        if (errors['lowercase']) this.passwordErrors.push('Password must contain at least one lowercase letter');
        if (errors['digit']) this.passwordErrors.push('Password must contain at least one digit');
        if (errors['specialChar']) this.passwordErrors.push('Password must contain at least one special character');
        if (errors['commonPassword']) this.passwordErrors.push('Password is too common and easily guessable');
        if (errors['repeatedChars']) this.passwordErrors.push('Password cannot contain more than 3 consecutive identical characters');
        if (errors['sequentialChars']) this.passwordErrors.push('Password cannot contain 3 or more sequential characters');
      }
    }
  }

  onInventoryRegister(): void {
    // Trim whitespace and validate
    this.registerData.username = this.registerData.username.trim();
    this.registerData.email = this.registerData.email.trim();
    this.registerData.fullName = this.registerData.fullName.trim();

    if (!this.registerData.username || !this.registerData.password || 
        !this.registerData.confirmPassword || !this.registerData.email || !this.registerData.fullName) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.registerData.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }

    // Validate password using our custom validator
    this.onPasswordChange();
    if (this.passwordErrors.length > 0) {
      this.errorMessage = this.passwordErrors[0]; // Show first error
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.registerInventoryTeam(this.registerData).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.setAuthData(response);
          setTimeout(() => {
            this.router.navigate(['/inventory/dashboard']);
          }, 500);
        } else {
          this.errorMessage = response.message || 'Registration failed';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Registration failed. Please check your information.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again.';
        } else {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
        
        this.loading = false;
      }
    });
  }

  onDeliveryLogin(): void {
    this.authService.loginDeliveryTeam();
  }
}