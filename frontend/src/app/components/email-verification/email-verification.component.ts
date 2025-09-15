import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatCardModule],
  template: `
    <div class="verification-container">
      <mat-card class="verification-card">
        <mat-card-content>
          <div *ngIf="loading" class="loading-section">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Verifying your email...</p>
          </div>
          
          <div *ngIf="!loading && verificationSuccess" class="success-section">
            <h2>Email Verified Successfully!</h2>
            <p>Your email has been verified. You will be redirected to the login page shortly.</p>
            <p *ngIf="redirectUrl" class="redirect-message">Redirecting to login page...</p>
            <p>If you are not redirected automatically, <a (click)="goToLogin()" class="redirect-link">click here</a>.</p>
          </div>
          
          <div *ngIf="!loading && !verificationSuccess" class="error-section">
            <h2>Verification Failed</h2>
            <p>{{ errorMessage }}</p>
            <button mat-raised-button color="primary" (click)="goToLogin()">Go to Login</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .verification-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 1rem;
    }
    
    .verification-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    
    .loading-section, .success-section, .error-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    mat-spinner {
      margin: 1rem 0;
    }
    
    h2 {
      margin: 0;
      color: #3f51b5;
    }
    
    .success-section h2 {
      color: #4caf50;
    }
    
    .error-section h2 {
      color: #f44336;
    }
    
    p {
      margin: 0.5rem 0;
      font-size: 1rem;
      line-height: 1.5;
    }
    
    button {
      margin-top: 1rem;
    }
    
    .redirect-link {
      color: #3f51b5;
      text-decoration: underline;
      cursor: pointer;
    }
    
    .redirect-message {
      font-weight: bold;
      color: #3f51b5;
    }
  `]
})
export class EmailVerificationComponent implements OnInit {
  loading = true;
  verificationSuccess = false;
  errorMessage = 'Invalid or expired verification token.';
  redirectUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      } else {
        this.loading = false;
        this.verificationSuccess = false;
        this.errorMessage = 'No verification token provided.';
      }
    });
  }

  private verifyEmail(token: string): void {
    // Make an HTTP request to your backend to verify the token
    fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        this.verificationSuccess = data.success;
        this.errorMessage = data.message;
        
        // If there's a redirect URL, redirect the user
        if (data.redirect) {
          this.redirectUrl = data.redirect;
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 3000); // Redirect after 3 seconds
        }
      })
      .catch(error => {
        this.loading = false;
        this.verificationSuccess = false;
        this.errorMessage = 'Verification failed. Please try again.';
        console.error('Verification error:', error);
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}