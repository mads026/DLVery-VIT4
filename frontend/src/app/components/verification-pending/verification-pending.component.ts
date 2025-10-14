import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verification-pending',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="verification-pending-container">
      <mat-card class="verification-card">
        <mat-card-content>
          <div class="pending-section">
            <mat-icon class="email-icon">mark_email_unread</mat-icon>
            <h2>Email Verification Required</h2>
            <p class="main-message">
              A verification email has been sent to <strong>{{ email }}</strong>
            </p>
            <p class="instruction">
              Please check your inbox and click the verification link to activate your account.
            </p>
            
            <div class="info-box">
              <mat-icon>info</mat-icon>
              <div class="info-content">
                <p><strong>Didn't receive the email?</strong></p>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Make sure {{ email }} is correct</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>
            </div>

            <div class="action-buttons">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="resendVerification()"
                [disabled]="resending || resendSuccess">
                <mat-icon>refresh</mat-icon>
                {{ resendSuccess ? 'Email Sent!' : (resending ? 'Sending...' : 'Resend Verification Email') }}
              </button>
              
              <button 
                mat-stroked-button 
                (click)="goToLogin()">
                <mat-icon>arrow_back</mat-icon>
                Back to Login
              </button>
            </div>

            <p *ngIf="errorMessage" class="error-message">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </p>
            
            <p *ngIf="resendSuccess" class="success-message">
              <mat-icon>check_circle</mat-icon>
              Verification email sent successfully! Please check your inbox.
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .verification-pending-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .verification-card {
      max-width: 600px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .pending-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem 1rem;
      text-align: center;
    }

    .email-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #667eea;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .main-message {
      font-size: 1.125rem;
      color: #475569;
      margin: 0;
      line-height: 1.6;
    }

    .main-message strong {
      color: #667eea;
      font-weight: 600;
    }

    .instruction {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    .info-box {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: #f1f5f9;
      border-radius: 12px;
      border-left: 4px solid #667eea;
      text-align: left;
      width: 100%;
      max-width: 500px;
    }

    .info-box mat-icon {
      color: #667eea;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .info-content {
      flex: 1;
    }

    .info-content p {
      margin: 0 0 0.75rem 0;
      color: #334155;
      font-weight: 500;
    }

    .info-content ul {
      margin: 0;
      padding-left: 1.25rem;
      color: #64748b;
    }

    .info-content li {
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 400px;
      margin-top: 1rem;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem !important;
      font-size: 1rem !important;
      font-weight: 500 !important;
      text-transform: none !important;
      border-radius: 8px !important;
    }

    button mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #fee2e2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      color: #dc2626;
      font-weight: 500;
      margin: 0;
      width: 100%;
      max-width: 500px;
    }

    .error-message mat-icon {
      color: #dc2626;
    }

    .success-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #d1fae5;
      border: 1px solid #10b981;
      border-radius: 8px;
      color: #059669;
      font-weight: 500;
      margin: 0;
      width: 100%;
      max-width: 500px;
    }

    .success-message mat-icon {
      color: #059669;
    }

    @media (max-width: 640px) {
      .verification-pending-container {
        padding: 0.5rem;
      }

      .pending-section {
        padding: 1.5rem 0.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      .main-message {
        font-size: 1rem;
      }

      .info-box {
        padding: 1rem;
      }
    }
  `]
})
export class VerificationPendingComponent implements OnInit {
  email: string = '';
  resending: boolean = false;
  resendSuccess: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || 'your email address';
    });
  }

  resendVerification(): void {
    if (this.resending || this.resendSuccess) {
      return;
    }

    this.resending = true;
    this.errorMessage = '';

    this.http.post(`${environment.authApiUrl}/resend-verification`, { email: this.email })
      .subscribe({
        next: () => {
          this.resending = false;
          this.resendSuccess = true;
          // Reset success message after 5 seconds
          setTimeout(() => {
            this.resendSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.resending = false;
          this.errorMessage = error.error?.message || 'Failed to resend verification email. Please try again.';
          console.error('Resend verification error:', error);
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
