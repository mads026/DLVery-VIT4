import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeliveryAgentProfileService, DeliveryAgentProfile } from '../../services/delivery-agent-profile.service';
import { ModernInputComponent } from '../../shared/components/modern-input/modern-input.component';

@Component({
  selector: 'app-delivery-profile-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ModernInputComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Modern Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-4 py-3">
          <button mat-icon-button (click)="goBack()" class="!text-gray-700 hover:!bg-gray-100" matTooltip="Back to Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <form [formGroup]="profileForm" class="space-y-6">



          <!-- Personal Information Section -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="!text-gray-600">person</mat-icon>
                Personal Information
              </h3>
              <p class="text-sm text-gray-600 mt-1">Enter your personal details</p>
            </div>

            <div class="space-y-4">
              <app-modern-input
                label="Name"
                placeholder="Enter your name"
                prefixIcon="badge"
                [required]="true"
                formControlName="displayName"
                [readonly]="!isFirstTimeSetup()"
                [error]="profileForm.get('displayName')?.invalid && profileForm.get('displayName')?.touched ? 'Name is required' : ''">
              </app-modern-input>

              <app-modern-input
                label="Phone Number"
                placeholder="+91 9876543210"
                prefixIcon="phone"
                [required]="true"
                formControlName="phoneNumber"
                [error]="profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched ? 'Phone number is required' : ''">
              </app-modern-input>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <mat-form-field appearance="outline" class="w-full">
                  <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" placeholder="Select date">
                  <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
                  <mat-datepicker #dobPicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Address Information Section -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="!text-gray-600">location_on</mat-icon>
                Address Information
              </h3>
              <p class="text-sm text-gray-600 mt-1">Enter your address details</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea 
                  formControlName="address"
                  rows="3"
                  placeholder="Enter your full address"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"></textarea>
              </div>

              <app-modern-input
                label="City"
                placeholder="Enter city"
                prefixIcon="location_city"
                [required]="true"
                formControlName="city"
                [error]="profileForm.get('city')?.invalid && profileForm.get('city')?.touched ? 'City is required' : ''">
              </app-modern-input>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select 
                  formControlName="state"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white">
                  <option value="">Select State</option>
                  <option *ngFor="let state of indianStates" [value]="state">{{ state }}</option>
                </select>
              </div>

              <app-modern-input
                label="Postal Code"
                placeholder="600001"
                prefixIcon="pin"
                [required]="true"
                formControlName="postalCode"
                [error]="profileForm.get('postalCode')?.invalid && profileForm.get('postalCode')?.touched ? 'Postal code is required' : ''">
              </app-modern-input>
            </div>
          </div>

          <!-- Vehicle & License Information Section -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="!text-gray-600">directions_car</mat-icon>
                Vehicle & License Information
              </h3>
              <p class="text-sm text-gray-600 mt-1">Enter your vehicle and license details</p>
            </div>

            <div class="space-y-4">
              <app-modern-input
                label="License Number"
                placeholder="DL1234567890"
                prefixIcon="credit_card"
                [required]="true"
                formControlName="licenseNumber"
                [error]="profileForm.get('licenseNumber')?.invalid && profileForm.get('licenseNumber')?.touched ? 'License number is required' : ''">
              </app-modern-input>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">License Expiry Date *</label>
                <mat-form-field appearance="outline" class="w-full">
                  <input matInput [matDatepicker]="licensePicker" formControlName="licenseExpiryDate" placeholder="Select date">
                  <mat-datepicker-toggle matSuffix [for]="licensePicker"></mat-datepicker-toggle>
                  <mat-datepicker #licensePicker></mat-datepicker>
                </mat-form-field>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                <select 
                  formControlName="vehicleType"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white">
                  <option value="">Select Vehicle Type</option>
                  <option value="Motorcycle">🏍️ Motorcycle</option>
                  <option value="Scooter">🛵 Scooter</option>
                  <option value="Car">🚗 Car</option>
                  <option value="Van">🚐 Van</option>
                  <option value="Truck">🚚 Truck</option>
                  <option value="Bicycle">🚲 Bicycle</option>
                </select>
              </div>

              <app-modern-input
                label="Vehicle Number"
                placeholder="TN01AB1234"
                prefixIcon="directions_car"
                [required]="true"
                formControlName="vehicleNumber"
                [error]="profileForm.get('vehicleNumber')?.invalid && profileForm.get('vehicleNumber')?.touched ? 'Vehicle number is required' : ''">
              </app-modern-input>
            </div>
          </div>

          <!-- Emergency Contact Section -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="!text-gray-600">contact_emergency</mat-icon>
                Emergency Contact
              </h3>
              <p class="text-sm text-gray-600 mt-1">Enter emergency contact information</p>
            </div>

            <div class="space-y-4">
              <app-modern-input
                label="Emergency Contact Name"
                placeholder="Contact person name"
                prefixIcon="contact_emergency"
                formControlName="emergencyContactName">
              </app-modern-input>

              <app-modern-input
                label="Emergency Contact Phone"
                placeholder="+91 9876543210"
                prefixIcon="phone"
                formControlName="emergencyContactPhone">
              </app-modern-input>
            </div>
          </div>

          <!-- Bank Details Section -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="!text-gray-600">account_balance</mat-icon>
                Bank Details (Optional)
              </h3>
              <p class="text-sm text-gray-600 mt-1">Enter your bank account information</p>
            </div>

            <div class="space-y-4">
              <app-modern-input
                label="Bank Name"
                placeholder="State Bank of India"
                prefixIcon="account_balance"
                formControlName="bankName">
              </app-modern-input>

              <app-modern-input
                label="Account Number"
                placeholder="1234567890"
                prefixIcon="credit_card"
                formControlName="bankAccountNumber">
              </app-modern-input>

              <app-modern-input
                label="IFSC Code"
                placeholder="SBIN0001234"
                prefixIcon="code"
                formControlName="ifscCode">
              </app-modern-input>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <div class="flex justify-center">
              <button 
                mat-raised-button 
                class="!bg-gradient-to-r !from-primary-600 !to-primary-700 !text-white !font-medium !rounded-xl hover:!shadow-lg !transition-all !px-8 !py-3"
                (click)="saveProfile()" 
                [disabled]="loading || !profileForm.valid">
                <mat-spinner *ngIf="loading" diameter="20" class="!mr-2" style="display: inline-block;"></mat-spinner>
                <mat-icon *ngIf="!loading" class="!mr-2">save</mat-icon>
                {{ loading ? 'Saving...' : 'Complete Setup' }}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .full-width {
      grid-column: 1 / -1;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: white;
    }

    ::ng-deep .readonly-field .mat-mdc-text-field-wrapper {
      background-color: #f9fafb !important;
    }

    ::ng-deep .readonly-field input {
      color: #6b7280 !important;
      cursor: not-allowed !important;
    }
  `]
})
export class DeliveryProfileSetupComponent implements OnInit {
  profileForm: FormGroup;

  profile: DeliveryAgentProfile | null = null;
  loading = false;

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: DeliveryAgentProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createProfileForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      displayName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s-()]{10,15}$/)]],
      dateOfBirth: ['', Validators.required],

      // Address Information
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],

      // Vehicle & License Information
      licenseNumber: ['', Validators.required],
      licenseExpiryDate: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleNumber: ['', Validators.required],

      // Emergency Contact
      emergencyContactName: [''],
      emergencyContactPhone: [''],

      // Bank Details (Optional)
      bankName: [''],
      bankAccountNumber: [''],
      ifscCode: ['']
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.populateFormWithProfile(profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
      }
    });
  }

  populateFormWithProfile(profile: DeliveryAgentProfile): void {
    this.profileForm.patchValue({
      displayName: profile.displayName,
      phoneNumber: profile.phoneNumber,
      dateOfBirth: profile.dateOfBirth,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      postalCode: profile.postalCode,
      licenseNumber: profile.licenseNumber,
      licenseExpiryDate: profile.licenseExpiryDate,
      vehicleType: profile.vehicleType,
      vehicleNumber: profile.vehicleNumber,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      bankName: profile.bankName,
      bankAccountNumber: profile.bankAccountNumber,
      ifscCode: profile.ifscCode
    });
  }

  isFirstTimeSetup(): boolean {
    return !this.profile?.isProfileComplete;
  }

  goBack(): void {
    this.router.navigate(['/delivery/dashboard']);
  }

  saveProfile(): void {
    if (!this.profileForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    const profileData: DeliveryAgentProfile = {
      ...this.profileForm.value,
      isAvailable: true
    };

    this.profileService.createOrUpdateProfile(profileData).subscribe({
      next: (updatedProfile) => {
        this.loading = false;
        this.snackBar.open('Profile setup completed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/delivery/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving profile:', error);
        this.snackBar.open('Error saving profile. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
