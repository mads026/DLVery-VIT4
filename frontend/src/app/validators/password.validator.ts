import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  // Password validation rules matching the backend PasswordValidator
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const errors: any = {};
      
      // Length validation (8-128 characters)
      if (value.length < 8) {
        errors.minLength = true;
      }
      
      if (value.length > 128) {
        errors.maxLength = true;
      }
      
      // Character type validation
      if (!/[A-Z]/.test(value)) {
        errors.uppercase = true;
      }
      
      if (!/[a-z]/.test(value)) {
        errors.lowercase = true;
      }
      
      if (!/[0-9]/.test(value)) {
        errors.digit = true;
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.specialChar = true;
      }
      
      // Check for common weak passwords
      const commonPasswords = [
        "password", "123456", "password123", "admin", "qwerty", 
        "letmein", "welcome", "monkey", "1234567890", "password1"
      ];
      
      const lowerValue = value.toLowerCase();
      if (commonPasswords.some(p => lowerValue === p)) {
        errors.commonPassword = true;
      }
      
      // Check for repeated characters (more than 3 consecutive)
      if (/(.)\1{3,}/.test(value)) {
        errors.repeatedChars = true;
      }
      
      // Check for sequential characters (like 123 or abc)
      let hasSequential = false;
      for (let i = 0; i <= value.length - 3; i++) {
        const substr = value.substring(i, i + 3);
        if (isSequential(substr)) {
          hasSequential = true;
          break;
        }
      }
      
      if (hasSequential) {
        errors.sequentialChars = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
  
  static match(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField)?.value;
      const confirmPassword = control.get(confirmPasswordField)?.value;
      
      if (!password || !confirmPassword) {
        return null;
      }
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}

function isSequential(str: string): boolean {
  // Check ascending sequence
  let isAscending = true;
  for (let i = 1; i < str.length; i++) {
    if (str.charCodeAt(i) !== str.charCodeAt(i - 1) + 1) {
      isAscending = false;
      break;
    }
  }
  
  // Check descending sequence
  let isDescending = true;
  for (let i = 1; i < str.length; i++) {
    if (str.charCodeAt(i) !== str.charCodeAt(i - 1) - 1) {
      isDescending = false;
      break;
    }
  }
  
  return isAscending || isDescending;
}