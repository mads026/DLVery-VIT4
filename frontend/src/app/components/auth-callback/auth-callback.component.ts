import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Processing Google authentication...</p>
      <p class="sub-text">Please wait while we complete your login</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }
    
    .sub-text {
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const role = params['role'];
      const username = params['username'];
      const email = params['email'];
      
      if (token && role) {
        this.authService.handleAuthCallback(token, role, username, email);
      } else {
        // Handle error case - redirect to login with error message
        setTimeout(() => {
          this.authService.logout();
        }, 2000);
      }
    });
  }
}