import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modern-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModernInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="modern-input-wrapper">
      <label *ngIf="label" class="modern-input-label" [class.required]="required">
        {{ label }}
      </label>
      <div class="modern-input-container" [class.has-error]="error" [class.disabled]="disabled">
        <mat-icon *ngIf="prefixIcon" class="prefix-icon">{{ prefixIcon }}</mat-icon>
        
        <input
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          (blur)="onTouched()"
          (input)="onInputChange($event)"
          class="modern-input"
          [class.has-prefix]="prefixIcon"
          [class.has-suffix]="suffixIcon || clearable"
        />
        
        <button
          *ngIf="clearable && value && !disabled"
          type="button"
          class="clear-button"
          (click)="clearValue()"
          tabindex="-1">
          <mat-icon>close</mat-icon>
        </button>
        
        <mat-icon *ngIf="suffixIcon && !(clearable && value)" class="suffix-icon">{{ suffixIcon }}</mat-icon>
      </div>
      <div *ngIf="error" class="error-message">
        <mat-icon class="error-icon">error</mat-icon>
        <span>{{ error }}</span>
      </div>
      <div *ngIf="hint && !error" class="hint-message">
        {{ hint }}
      </div>
    </div>
  `,
  styles: [`
    .modern-input-wrapper {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .modern-input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .modern-input-label.required::after {
      content: ' *';
      color: #ef4444;
    }

    .modern-input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .modern-input-container:hover:not(.disabled) {
      border-color: #9ca3af;
    }

    .modern-input-container:focus-within:not(.disabled) {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modern-input-container.has-error {
      border-color: #ef4444;
    }

    .modern-input-container.has-error:focus-within {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .modern-input-container.disabled {
      background: #f3f4f6;
      border-color: #e5e7eb;
      cursor: not-allowed;
    }

    .modern-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      outline: none;
      font-size: 0.875rem;
      color: #1f2937;
      background: transparent;
      width: 100%;
    }

    .modern-input.has-prefix {
      padding-left: 0.5rem;
    }

    .modern-input.has-suffix {
      padding-right: 0.5rem;
    }

    .modern-input::placeholder {
      color: #9ca3af;
    }

    .modern-input:disabled {
      cursor: not-allowed;
      color: #6b7280;
    }

    .prefix-icon,
    .suffix-icon {
      color: #6b7280;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .prefix-icon {
      margin-left: 0.75rem;
      margin-right: 0.25rem;
    }

    .suffix-icon {
      margin-right: 0.75rem;
      margin-left: 0.25rem;
    }

    .clear-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      margin-right: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #6b7280;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .clear-button:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .clear-button mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #ef4444;
    }

    .error-icon {
      font-size: 0.875rem;
      width: 0.875rem;
      height: 0.875rem;
    }

    .hint-message {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  `]
})
export class ModernInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearable = false;
  
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  clearValue(): void {
    this.value = '';
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}
