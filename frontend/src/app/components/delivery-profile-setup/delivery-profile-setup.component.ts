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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-setup-container">
      <div class="setup-card">
        <mat-card class="setup-mat-card">
          <mat-card-header>
            <div class="setup-header">
              <button mat-icon-button (click)="goBack()" class="back-button" matTooltip="Back to Dashboard">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <mat-icon class="setup-icon">person_add</mat-icon>
              <div class="setup-text">
                <h1 class="setup-title">Complete Your Profile</h1>
                <p class="setup-subtitle">Please fill in your details to start delivering</p>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content class="setup-content">
            <form [formGroup]="profileForm" class="profile-form">



              <!-- Personal Information Section -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="section-icon">person</mat-icon>
                  <h2 class="section-title">Personal Information</h2>
                </div>

                <div class="form-grid">
                  <mat-form-field appearance="outline" [class.readonly-field]="!isFirstTimeSetup()">
                    <mat-label>Name</mat-label>
                    <input matInput formControlName="displayName"
                           [readonly]="!isFirstTimeSetup()"
                           placeholder="Enter your name">
                    <mat-icon matSuffix>badge</mat-icon>
                    <mat-hint *ngIf="isFirstTimeSetup()">This name will be shown to customers</mat-hint>
                    <mat-hint *ngIf="!isFirstTimeSetup()">Name cannot be changed after setup</mat-hint>
                    <mat-error *ngIf="profileForm.get('displayName')?.hasError('required')">
                      Name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" placeholder="+91 9876543210">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                      Phone number is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth">
                    <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
                    <mat-datepicker #dobPicker></mat-datepicker>
                    <mat-error *ngIf="profileForm.get('dateOfBirth')?.hasError('required')">
                      Date of birth is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Address Information Section -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="section-icon">location_on</mat-icon>
                  <h2 class="section-title">Address Information</h2>
                </div>

                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" rows="3" placeholder="Enter your full address"></textarea>
                    <mat-icon matSuffix>home</mat-icon>
                    <mat-error *ngIf="profileForm.get('address')?.hasError('required')">
                      Address is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" placeholder="Enter city">
                    <mat-error *ngIf="profileForm.get('city')?.hasError('required')">
                      City is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>State</mat-label>
                    <mat-select formControlName="state">
                      <mat-option *ngFor="let state of indianStates" [value]="state">{{ state }}</mat-option>
                    </mat-select>
                    <mat-error *ngIf="profileForm.get('state')?.hasError('required')">
                      State is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Postal Code</mat-label>
                    <input matInput formControlName="postalCode" placeholder="600001">
                    <mat-error *ngIf="profileForm.get('postalCode')?.hasError('required')">
                      Postal code is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Vehicle & License Information Section -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="section-icon">directions_car</mat-icon>
                  <h2 class="section-title">Vehicle & License Information</h2>
                </div>

                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>License Number</mat-label>
                    <input matInput formControlName="licenseNumber" placeholder="DL1234567890">
                    <mat-icon matSuffix>credit_card</mat-icon>
                    <mat-error *ngIf="profileForm.get('licenseNumber')?.hasError('required')">
                      License number is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>License Expiry Date</mat-label>
                    <input matInput [matDatepicker]="licensePicker" formControlName="licenseExpiryDate">
                    <mat-datepicker-toggle matSuffix [for]="licensePicker"></mat-datepicker-toggle>
                    <mat-datepicker #licensePicker></mat-datepicker>
                    <mat-error *ngIf="profileForm.get('licenseExpiryDate')?.hasError('required')">
                      License expiry date is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Vehicle Type</mat-label>
                    <mat-select formControlName="vehicleType">
                      <mat-option value="Motorcycle">🏍️ Motorcycle</mat-option>
                      <mat-option value="Scooter">🛵 Scooter</mat-option>
                      <mat-option value="Car">🚗 Car</mat-option>
                      <mat-option value="Van">🚐 Van</mat-option>
                      <mat-option value="Truck">🚚 Truck</mat-option>
                      <mat-option value="Bicycle">🚲 Bicycle</mat-option>
                    </mat-select>
                    <mat-error *ngIf="profileForm.get('vehicleType')?.hasError('required')">
                      Vehicle type is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Vehicle Number</mat-label>
                    <input matInput formControlName="vehicleNumber" placeholder="TN01AB1234">
                    <mat-icon matSuffix>directions_car</mat-icon>
                    <mat-error *ngIf="profileForm.get('vehicleNumber')?.hasError('required')">
                      Vehicle number is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Emergency Contact Section -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="section-icon">contact_emergency</mat-icon>
                  <h2 class="section-title">Emergency Contact</h2>
                </div>

                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Emergency Contact Name</mat-label>
                    <input matInput formControlName="emergencyContactName" placeholder="Contact person name">
                    <mat-icon matSuffix>contact_emergency</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Emergency Contact Phone</mat-label>
                    <input matInput formControlName="emergencyContactPhone" placeholder="+91 9876543210">
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <!-- Bank Details Section -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="section-icon">account_balance</mat-icon>
                  <h2 class="section-title">Bank Details (Optional)</h2>
                </div>

                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Bank Name</mat-label>
                    <input matInput formControlName="bankName" placeholder="State Bank of India">
                    <mat-icon matSuffix>account_balance</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Account Number</mat-label>
                    <input matInput formControlName="bankAccountNumber" placeholder="1234567890">
                    <mat-icon matSuffix>credit_card</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>IFSC Code</mat-label>
                    <input matInput formControlName="ifscCode" placeholder="SBIN0001234">
                    <mat-icon matSuffix>code</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button mat-raised-button color="accent" (click)="saveProfile()" [disabled]="loading || !profileForm.valid" class="save-button">
                  <mat-spinner *ngIf="loading" diameter="20" class="button-spinner"></mat-spinner>
                  <mat-icon *ngIf="!loading">save</mat-icon>
                  {{ loading ? 'Saving...' : 'Complete Setup' }}
                </button>
              </div>

            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-setup-container {
      min-height: 100vh;
      background: #f8fafc;
      padding: 2rem;
    }

    .setup-card {
      max-width: 900px;
      margin: 0 auto;
    }

    .setup-mat-card {
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .setup-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .setup-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #3b82f6;
    }

    .setup-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .setup-subtitle {
      font-size: 1rem;
      color: #64748b;
      margin: 0.5rem 0 0 0;
    }

    .setup-content {
      padding: 2rem !important;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Info Section */
    .info-section {
      margin-bottom: 1rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .section-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: #3b82f6;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .info-card {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .info-text {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #0c4a6e;
      line-height: 1.5;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    /* Form Sections */
    .form-section {
      margin-bottom: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    /* Action Buttons */
    .form-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }

    .save-button {
      padding: 1rem 3rem !important;
      font-size: 1.125rem !important;
      font-weight: 600 !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      background: #dc2626 !important;
      color: white !important;
    }

    .save-button:hover:not(:disabled) {
      background: #b91c1c !important;
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
    }

    .save-button:disabled {
      background: #9ca3af !important;
      color: #d1d5db !important;
      cursor: not-allowed !important;
    }

    .button-spinner {
      margin-right: 0.75rem;
    }

    /* Readonly field styling */
    .readonly-field {
      opacity: 0.7;
    }

    .readonly-field input {
      background-color: #f8fafc !important;
      color: #64748b !important;
      cursor: not-allowed !important;
    }

    .readonly-field .mat-mdc-form-field-focus-overlay {
      display: none !important;
    }

    .readonly-field .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }

    .readonly-field mat-hint {
      color: #64748b;
      font-size: 0.75rem;
      font-style: italic;
    }

    /* Back button styling */
    .back-button {
      background: #f8fafc !important;
      color: #374151 !important;
      border: 2px solid #e2e8f0 !important;
      width: 48px !important;
      height: 48px !important;
      margin-right: 0.5rem !important;
    }

    .back-button:hover {
      background: #e2e8f0 !important;
      border-color: #cbd5e1 !important;
    }

    .back-button mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .profile-setup-container {
        padding: 1rem;
      }

      .setup-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .setup-content {
        padding: 1.5rem !important;
        max-height: calc(100vh - 150px);
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .save-button {
        width: 100%;
        padding: 1rem 2rem !important;
        font-size: 1rem !important;
      }
    }

    /* Scrollbar styling */
    .setup-content::-webkit-scrollbar {
      width: 6px;
    }

    .setup-content::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    .setup-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .setup-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
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
