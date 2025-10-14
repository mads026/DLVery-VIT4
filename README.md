# DIVery - Logistics Management System

A comprehensive logistics and delivery management web application for DIVery's warehouse and delivery operations across Tier 1 and Tier 2 cities in India.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-20.3.0-red)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)](https://www.mysql.com/)

## 📋 Overview

DIVery is a logistics company operating in major Indian cities, expanding to new markets with a modern tech stack. This application serves two primary user groups:

- **Inventory Team (InvTeam)**: Warehouse staff managing product inventory, tracking goods movement, and coordinating deliveries
- **Delivery Team (DlTeam)**: On-ground delivery agents handling consignment delivery and customer interactions

## ✨ Key Features

### 🔐 Authentication & Security
- Dual login system for Inventory and Delivery teams
- JWT-based authentication with role-based access control
- Google OAuth2 integration for delivery agents
- Email verification and password validation

### 📦 Inventory Management (InvTeam)
- **Product Management**: Add, update, and track inventory with categorization
- **Smart Inventory Tracking**: Monitor products by category, damage status, perishability, and expiry dates
- **Bulk Upload**: Import inventory data via CSV files
- **Real-time Inventory**: Check current stock levels anytime
- **Delivery Coordination**: Assign products to delivery agents and track assignments
- **Movement Logging**: Track all inventory movements (in/out/damaged/expired)
- **Comprehensive Reports**:
  - Delivery reports by date range
  - Damaged goods tracking
  - Pending deliveries by agent

### 🚚 Delivery Management (DlTeam)
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Daily Delivery Overview**: View today's deliveries and pending tasks
- **Priority-based Delivery**: Handle perishable, essential, and emergency items first
- **Delivery Completion**: Capture customer signatures and delivery confirmation
- **Exception Handling**:
  - Door lock situations
  - Damaged goods management
  - Return delivery processing

## 🛠 Technology Stack

### Frontend
- **Angular** (Latest) - Progressive web app framework
- **Google Material Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Enhanced JavaScript for better development

### Backend
- **Spring Boot** - Java web framework
- **Spring Web** - REST API development
- **Spring Security** - Authentication and authorization

### Database
- **MySQL** - Relational database for data persistence

## 🚀 Quick Start

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm
- **MySQL 8.0** or higher
- **Maven 3.6** or higher

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Backend will be available at: `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will be available at: `http://localhost:4200`
