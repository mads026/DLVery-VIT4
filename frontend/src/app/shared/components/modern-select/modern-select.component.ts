import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-modern-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModernSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="modern-select-wrapper">
      <label *ngIf="label" class="modern-select-label" [class.required]="required">
        {{ label }}
      </label>
      <div class="modern-select-container" [class.has-error]="error" [class.disabled]="disabled">
        <mat-icon *ngIf="prefixIcon" class="prefix-icon">{{ prefixIcon }}</mat-icon>
        
        <select
          [(ngModel)]="value"
          (blur)="onTouched()"
          (change)="onSelectChange($event)"
          [disabled]="disabled"
          class="modern-select"
          [class.has-prefix]="prefixIcon">
          <option value="" *ngIf="placeholder">{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
        
        <mat-icon class="suffix-icon">expand_more</mat-icon>
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
    .modern-select-wrapper {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .modern-select-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .modern-select-label.required::after {
      content: ' *';
      color: #ef4444;
    }

    .modern-select-container {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .modern-select-container:hover:not(.disabled) {
      border-color: #9ca3af;
    }

    .modern-select-container:focus-within:not(.disabled) {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modern-select-container.has-error {
      border-color: #ef4444;
    }

    .modern-select-container.has-error:focus-within {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .modern-select-container.disabled {
      background: #f3f4f6;
      border-color: #e5e7eb;
      cursor: not-allowed;
    }

    .modern-select {
      flex: 1;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem;
      border: none;
      outline: none;
      font-size: 0.875rem;
      color: #1f2937;
      background: transparent;
      width: 100%;
      cursor: pointer;
      appearance: none;
    }

    .modern-select.has-prefix {
      padding-left: 0.5rem;
    }

    .modern-select:disabled {
      cursor: not-allowed;
      color: #6b7280;
    }

    .modern-select option {
      padding: 0.5rem;
    }

    .prefix-icon {
      color: #6b7280;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      margin-left: 0.75rem;
      margin-right: 0.25rem;
    }

    .suffix-icon {
      position: absolute;
      right: 0.75rem;
      color: #6b7280;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      pointer-events: none;
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
export class ModernSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() prefixIcon = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  
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

  onSelectChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}
