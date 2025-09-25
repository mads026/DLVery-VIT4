import { FormControl, FormGroup } from '@angular/forms';
import { PasswordValidator } from './password.validator';

describe('PasswordValidator', () => {
  
  describe('strong validator', () => {
    const strongValidator = PasswordValidator.strong();

    it('should return null for valid password', () => {
      const control = new FormControl('SecurePass123!');
      const result = strongValidator(control);
      expect(result).toBeNull();
    });

    it('should return error for password too short', () => {
      const control = new FormControl('Short1!');
      const result = strongValidator(control);
      expect(result).toEqual({ minLength: true });
    });

    it('should return error for password too long', () => {
      const control = new FormControl('A'.repeat(129));
      const result = strongValidator(control);
      expect(result).toEqual({ maxLength: true });
    });

    it('should return error for missing uppercase', () => {
      const control = new FormControl('lowercase123!');
      const result = strongValidator(control);
      expect(result).toEqual({ uppercase: true });
    });

    it('should return error for missing lowercase', () => {
      const control = new FormControl('UPPERCASE123!');
      const result = strongValidator(control);
      expect(result).toEqual({ lowercase: true });
    });

    it('should return error for missing digit', () => {
      const control = new FormControl('NoDigitsHere!');
      const result = strongValidator(control);
      expect(result).toEqual({ digit: true });
    });

    it('should return error for missing special character', () => {
      const control = new FormControl('NoSpecialChar123');
      const result = strongValidator(control);
      expect(result).toEqual({ specialChar: true });
    });

    it('should return error for common password', () => {
      const control = new FormControl('password');
      const result = strongValidator(control);
      expect(result).toEqual({ commonPassword: true });
    });

    it('should return error for repeated characters', () => {
      const control = new FormControl('Passssss123!');
      const result = strongValidator(control);
      expect(result).toEqual({ repeatedChars: true });
    });

    it('should return error for sequential characters', () => {
      const control = new FormControl('Password123!');
      const result = strongValidator(control);
      expect(result).toEqual({ sequentialChars: true });
    });

    it('should return null for null or empty password', () => {
      expect(strongValidator(new FormControl(null))).toBeNull();
      expect(strongValidator(new FormControl(''))).toBeNull();
    });
  });

  describe('match validator', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup({
        password: new FormControl(''),
        confirmPassword: new FormControl('')
      }, { validators: PasswordValidator.match('password', 'confirmPassword') });
    });

    it('should return null when passwords match', () => {
      formGroup.patchValue({
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      });

      expect(formGroup.errors).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      formGroup.patchValue({
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!'
      });

      expect(formGroup.errors).toEqual({ passwordMismatch: true });
    });

    it('should return null when passwords are empty', () => {
      formGroup.patchValue({
        password: '',
        confirmPassword: ''
      });

      expect(formGroup.errors).toBeNull();
    });
  });
});