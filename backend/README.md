# SellCars Backend

This project is the backend for the SellCars web application, which is designed to manage customers for a car dealership. The application supports three types of customers: private persons, companies, and dealers. This backend provides a REST API to manage customers, users, and authentication.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Validation](#validation)

## Project Description

SellCars is a car dealer company that sells vehicles to other car dealers (B2B), other companies, and private persons. The backend system handles customer data efficiently and provides a secure authentication mechanism. The customer module is designed to be user-friendly and supports features like multiple contact persons and addresses per customer.

## Features

- User authentication using JWT
- Customer management (CRUD operations)
- Support for multiple customer types (Private, Company, Dealer)
- Handling of multiple contact persons and addresses per customer
- CSV upload for bulk customer, contact person, and address management
- API routes protected by authentication middleware

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Multer (for file uploads)
- dotenv (for environment variables)

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/ganpat-kalal/SellCars-Customer-Module.git
    cd SellCars-Customer-Module/backend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    PORT=5000
    NODE_ENV=development
    ```

4. Start the server:

    ```sh
    npm start
    ```

## API Endpoints

### User Routes

- `POST /api/users/login` - Login a user

### Customer Routes

- `GET /api/customers` - Get all customers
- `GET /api/customers/:intnr` - Get a customer by internal number
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:intnr` - Update a customer
- `DELETE /api/customers/:intnr` - Delete a customer
- `POST /api/customers/upload/customers` - Upload customers via CSV
- `POST /api/customers/upload/contact-persons` - Upload contact persons via CSV
- `POST /api/customers/upload/addresses` - Upload addresses via CSV

## Database Models

### User Model

- `first_name` (String, required)
- `last_name` (String, required)
- `email` (String, required, unique)
- `password_hash` (String, required)
- `created_at` (Date, default: Date.now)
- `updated_at` (Date, default: Date.now)

### Customer Model

- `intnr` (String, required, unique)
- `type` (String, required, enum: ['PRIVATE', 'COMPANY', 'DEALER'])
- `contact_persons` (Array of ContactPerson, required)
- `addresses` (Array of Address, required)
- `created_at` (Date, default: Date.now)
- `updated_at` (Date, default: Date.now)

### ContactPerson Model

- `first_name` (String, required)
- `last_name` (String, required)
- `email` (String, required)
- `mobile_phone` (String)
- `birth_date` (String, format: YYYY-MM-DD)
- `address` (ObjectId, ref: 'Address')

### Address Model

- `company_name` (String)
- `country` (String, required)
- `city` (String, required)
- `zip` (String, required)
- `fax` (String)
- `phone` (String)
- `street` (String, required)
- `email` (String)

## Middleware

### Auth Middleware

- `authMiddleware.js` - Verifies JWT tokens and protects routes from unauthorized access.

### Validation

- `validateContactPerson` - Validates contact person data
- `validateAddress` - Validates address data
- `validateFileType` - Validates CSV file structure

For more details, refer to the project description and the provided code files.