# SellCars Customer Module

This project is a customer management module for the SellCars web application. It includes both backend and frontend components to manage customers efficiently. The system supports three types of customers: private persons, companies, and dealers. The frontend and backend communicate via REST API.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Project Structure](#project-structure)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Database Models](#database-models)
- [Frontend](#frontend)
  - [Components](#components)
  - [Services](#services)
  - [Views](#views)
- [Using CSV Files for Testing](#using-csv-files-for-testing)

## Project Description

SellCars is a car dealer company that sells vehicles to other car dealers (B2B), other companies, and private persons. This customer module is designed to be user-friendly and supports features like multiple contact persons and addresses per customer.

## Features

- User authentication using JWT
- Customer management (CRUD operations)
- Support for multiple customer types (Private, Company, Dealer)
- Handling of multiple contact persons and addresses per customer
- CSV upload for bulk customer, contact person, and address management
- Responsive design

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Multer (for file uploads)
- Vue.js 3 (Composition API)
- TypeScript
- Axios
- Bootstrap

## Getting Started

### Backend Setup

1. **Navigate to the backend directory:**

   ```sh
   cd backend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file in the backend directory and add the following environment variables:**

   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the backend server:**

   ```sh
   npm start
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```sh
   cd frontend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file in the frontend directory and add the following environment variables:**

   ```env
   VUE_APP_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server:**

   ```sh
   npm run serve
   ```

## Project Structure

```bash
SELLCARS-CUSTOMER-MODULE/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── enums/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── app.js
│   ├── createUsers.js
│   ├── validation.js
├── frontend/
│   ├── assets/
│   ├── components/
│   │   ├── CustomerModal.vue
│   │   ├── ConfirmModal.vue
│   │   ├── ToastComponent.vue
│   │   ├── SidebarComponent.vue
│   │   ├── TableComponent.vue
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── customerService.ts
│   │   ├── authService.ts
│   ├── types/
│   │   └── Customer.ts
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── CustomersView.vue
│   ├── App.vue
│   ├── main.ts
├── addresses_invalid.csv
├── addresses.csv
├── contact_persons_invalid.csv
├── contact_persons.csv
├── customers_duplicate.csv
├── customers_invalid.csv
├── customers.csv
└── .gitignore
```

## Backend

### API Endpoints

#### User Routes

- `POST /api/users/login` - Login a user

#### Customer Routes

- `GET /api/customers` - Get all customers
- `GET /api/customers/:intnr` - Get a customer by internal number
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:intnr` - Update a customer
- `DELETE /api/customers/:intnr` - Delete a customer
- `POST /api/customers/upload/customers` - Upload customers via CSV
- `POST /api/customers/upload/contact-persons` - Upload contact persons via CSV
- `POST /api/customers/upload/addresses` - Upload addresses via CSV

### Database Models

#### User Model

- `first_name` (String, required)
- `last_name` (String, required)
- `email` (String, required, unique)
- `password_hash` (String, required)
- `created_at` (Date, default: Date.now)
- `updated_at` (Date, default: Date.now)

#### Customer Model

- `intnr` (String, required, unique)
- `type` (String, required, enum: ['PRIVATE', 'COMPANY', 'DEALER'])
- `contact_persons` (Array of ContactPerson, required)
- `addresses` (Array of Address, required)
- `created_at` (Date, default: Date.now)
- `updated_at` (Date, default: Date.now)

#### ContactPerson Model

- `first_name` (String, required)
- `last_name` (String, required)
- `email` (String, required)
- `mobile_phone` (String)
- `birth_date` (String, format: YYYY-MM-DD)
- `address` (ObjectId, ref: 'Address')

#### Address Model

- `company_name` (String)
- `country` (String, required)
- `city` (String, required)
- `zip` (String, required)
- `fax` (String)
- `phone` (String)
- `street` (String, required)
- `email` (String)

## Frontend

### Components

#### CustomerModal.vue

- Modal component for creating and editing customer details.

#### ConfirmModal.vue

- Modal component for confirming actions such as deletions.

#### ToastComponent.vue

- Component for displaying toast notifications.

#### SidebarComponent.vue

- Component for displaying the sidebar navigation.

#### TableComponent.vue

- Component for displaying customers in a table format with sortable and searchable columns.

### Services

#### customerService.ts

- Provides functions to interact with the backend customer API:
  - `fetchCustomers`
  - `createCustomer`
  - `deleteCustomer`
  - `updateCustomer`
  - `uploadFile`

#### authService.ts

- Provides functions for authentication:
  - `login`
  - `getCurrentUser`
  - `logOut`

### Views

#### LoginView.vue

- View for the login page.

#### CustomersView.vue

- View for displaying and managing customers.

## Using CSV Files for Testing

This project includes several CSV files for testing customer data import functionality.

### CSV Files

- `customers.csv` - Valid customer data
- `customers_invalid.csv` - Invalid customer data
- `customers_duplicate.csv` - Duplicate customer data
- `contact_persons.csv` - Valid contact person data
- `contact_persons_invalid.csv` - Invalid contact person data
- `addresses.csv` - Valid address data
- `addresses_invalid.csv` - Invalid address data

For more details, refer to the project description and the provided code files.