import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService } from '../../services/profile.service';
import { InventoryProfile } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: InventoryProfile | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditingProfile = false;
  isChangingPassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile && this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isEditingProfile = false;
          this.loading = false;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || 'Failed to update profile';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.profileService.changePassword(this.passwordForm.value).subscribe({
        next: (response) => {
          this.passwordForm.reset();
          this.isChangingPassword = false;
          this.loading = false;
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || 'Failed to change password';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  formatDate(date: string | null): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }
}
