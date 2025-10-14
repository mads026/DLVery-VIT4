import { Injectable } from '@angular/core';
import { PasswordValidator } from '../validators/password.validator';
import { LoginRequest, RegisterRequest } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
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

  validateLoginCredentials(credentials: LoginRequest): string | null {
    if (!credentials.username || !credentials.password) {
      return 'Please enter both username and password';
    }

    if (credentials.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (credentials.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return null;
  }

  validateRegistrationData(data: RegisterRequest): { isValid: boolean; error: string | null; passwordErrors: string[] } {
    if (!data.username || !data.password || !data.confirmPassword || !data.email || !data.fullName) {
      return { isValid: false, error: 'Please fill in all fields', passwordErrors: [] };
    }

    if (data.username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long', passwordErrors: [] };
    }

    const passwordErrors = this.validatePassword(data.password);
    if (passwordErrors.length > 0) {
      return { isValid: false, error: passwordErrors[0], passwordErrors };
    }

    if (data.password !== data.confirmPassword) {
      return { isValid: false, error: 'Passwords do not match', passwordErrors: [] };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: 'Please enter a valid email address', passwordErrors: [] };
    }

    return { isValid: true, error: null, passwordErrors: [] };
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (password) {
      const validationErrors = PasswordValidator.strong()(password as any);
      if (validationErrors) {
        Object.keys(validationErrors).forEach(errorKey => {
          const message = this.PASSWORD_ERROR_MESSAGES[errorKey];
          if (message) {
            errors.push(message);
          }
        });
      }
    }
    return errors;
  }
}
