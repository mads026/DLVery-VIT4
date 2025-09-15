import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  template: `
    <div class="password-strength-container" *ngIf="password">
      <div class="strength-meter">
        <mat-progress-bar 
          mode="determinate" 
          [value]="strengthPercentage"
          [color]="strengthColor">
        </mat-progress-bar>
      </div>
      
      <div class="strength-label">
        <mat-icon class="strength-icon" [ngClass]="strengthIconColor">{{ strengthIcon }}</mat-icon>
        <span class="strength-text">{{ strengthText }}</span>
      </div>
      
      <div class="password-requirements" *ngIf="showRequirements">
        <div class="requirement" [ngClass]="{ 'met': hasMinLength }">
          <mat-icon class="requirement-icon">{{ hasMinLength ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>At least 8 characters</span>
        </div>
        
        <div class="requirement" [ngClass]="{ 'met': hasUppercase }">
          <mat-icon class="requirement-icon">{{ hasUppercase ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>One uppercase letter</span>
        </div>
        
        <div class="requirement" [ngClass]="{ 'met': hasLowercase }">
          <mat-icon class="requirement-icon">{{ hasLowercase ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>One lowercase letter</span>
        </div>
        
        <div class="requirement" [ngClass]="{ 'met': hasDigit }">
          <mat-icon class="requirement-icon">{{ hasDigit ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>One number</span>
        </div>
        
        <div class="requirement" [ngClass]="{ 'met': hasSpecialChar }">
          <mat-icon class="requirement-icon">{{ hasSpecialChar ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>One special character</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent {
  @Input() password: string = '';
  @Input() showRequirements: boolean = true;
  
  get strengthPercentage(): number {
    if (!this.password) return 0;
    
    let score = 0;
    const maxLength = 20; // For normalization
    
    // Length score (up to 30%)
    const length = Math.min(this.password.length / maxLength, 1);
    score += length * 30;
    
    // Character variety score (up to 70%)
    if (/[A-Z]/.test(this.password)) score += 14;
    if (/[a-z]/.test(this.password)) score += 14;
    if (/[0-9]/.test(this.password)) score += 14;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password)) score += 14;
    
    // Bonus for mixing character types
    const types = [
      /[A-Z]/.test(this.password),
      /[a-z]/.test(this.password),
      /[0-9]/.test(this.password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password)
    ].filter(Boolean).length;
    
    if (types >= 3) score += 10;
    if (types === 4) score += 10;
    
    return Math.min(score, 100);
  }
  
  get strengthText(): string {
    const percentage = this.strengthPercentage;
    if (percentage < 20) return 'Very Weak';
    if (percentage < 40) return 'Weak';
    if (percentage < 60) return 'Fair';
    if (percentage < 80) return 'Good';
    return 'Strong';
  }
  
  get strengthColor(): 'warn' | 'accent' | 'primary' {
    const percentage = this.strengthPercentage;
    if (percentage < 40) return 'warn';
    if (percentage < 70) return 'accent';
    return 'primary';
  }
  
  get strengthIcon(): string {
    const percentage = this.strengthPercentage;
    if (percentage < 20) return 'lock_open';
    if (percentage < 40) return 'lock';
    if (percentage < 60) return 'enhanced_encryption';
    if (percentage < 80) return 'vpn_key';
    return 'security';
  }
  
  get strengthIconColor(): string {
    const percentage = this.strengthPercentage;
    if (percentage < 40) return 'weak';
    if (percentage < 70) return 'fair';
    return 'strong';
  }
  
  // Individual requirement checks
  get hasMinLength(): boolean {
    return !!this.password && this.password.length >= 8;
  }
  
  get hasUppercase(): boolean {
    return !!this.password && /[A-Z]/.test(this.password);
  }
  
  get hasLowercase(): boolean {
    return !!this.password && /[a-z]/.test(this.password);
  }
  
  get hasDigit(): boolean {
    return !!this.password && /[0-9]/.test(this.password);
  }
  
  get hasSpecialChar(): boolean {
    return !!this.password && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }
}