# DIVery - Delivery Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-20.3.0-red)](https://angular.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

### Prerequisites
- **Java 21**
- **Node.js 18+** and npm
- **MySQL 8.0+**
- **Maven 3.6+**
- **Google Cloud Console** account (for OAuth setup)

### 1. Database Setup
From the root directory, run these commands in your MySQL client:

```sql
CREATE DATABASE dlvery_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- NULL for OAuth users
    email VARCHAR(100) NULL UNIQUE, -- Email for registration
    full_name VARCHAR(100) NULL, -- Full name for registration
    oauth_provider ENUM('LOCAL', 'GOOGLE') NOT NULL,
    oauth_provider_id VARCHAR(100) NULL, -- For OAuth provider user ID
    role ENUM('INV_TEAM', 'DL_TEAM') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_oauth_provider (oauth_provider),
    INDEX idx_oauth_provider_id (oauth_provider_id)
);
```

### 2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:4200`

### 4. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`

## 👥 How to Login

### For Inventory Team
1. Open your browser and navigate to `http://localhost:4200`
2. Select the "Inventory Team" tab
3. You can either:
   - **Register a new account**
   - **Login with an existing account**

### For Delivery Team
1. Open your browser and navigate to `http://localhost:4200`
2. Select the "Delivery Team" tab
3. Click "Sign in with Google"
4. Complete the Google authentication process

## ✅ What's Completed

### Login System
- Dual authentication for Inventory and Delivery teams
- JWT token management
- Role-based access control (INV_TEAM, DL_TEAM)
- Secure password hashing with BCrypt
- Google OAuth2 integration for Delivery Team
- Email verification system
- Password validation system

## 🚧 What's Next

### 1. Inventory Management System (In Progress)
### 2. Delivery Agent Mobile Application

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of changes made"
   ```
5. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub for code review


---