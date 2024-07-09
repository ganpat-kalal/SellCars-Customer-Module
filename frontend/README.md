# SellCars Frontend

This project is the frontend for the SellCars web application, designed to manage customers for a car dealership. The application supports three types of customers: private persons, companies, and dealers. The frontend communicates with the backend via REST API to manage customers, users, and authentication.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components](#components)
- [Services](#services)
- [Views](#views)

## Project Description

SellCars is a car dealer company that sells vehicles to other car dealers (B2B), other companies, and private persons. This frontend system allows efficient handling of customer data and provides a user-friendly interface. It supports features like multiple contact persons and addresses per customer.

## Features

- User authentication
- Customer management (CRUD operations)
- Support for multiple customer types (Private, Company, Dealer)
- Handling of multiple contact persons and addresses per customer
- CSV upload for bulk customer, contact person, and address management
- Responsive design

## Technologies Used

- Vue.js 3 (Composition API)
- TypeScript
- Axios
- Bootstrap

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/ganpat-kalal/SellCars-Customer-Module.git
    cd SellCars-Customer-Module/frontend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    VUE_APP_API_BASE_URL=http://localhost:5000/api
    ```

4. Start the server:

    ```sh
    npm start
    ```

## Project Structure

```sh
src/
├── assets/
├── components/
│   ├── modals/
│       ├── CustomerModal.vue
│       ├── ConfirmModal.vue
│   ├── ToastComponent.vue
│   ├── SidebarComponent.vue
│   ├── TableComponent.vue
├── router/
│   └── index.ts
├── services/
│   ├── customerService.ts
│   ├── authService.ts
├── types/
│   └── Customer.ts
├── views/
│   ├── LoginView.vue
│   ├── CustomersView.vue
├── App.vue
├── main.ts
```

## Components

### CustomerModal.vue

- Modal component for creating and editing customer details.

### ConfirmModal.vue

- Modal component for confirming actions such as deletions.

### ToastComponent.vue

- Component for displaying toast notifications.

### SidebarComponent.vue

- Component for displaying the sidebar navigation.

### TableComponent.vue

- Component for displaying customers in a table format with sortable and searchable columns.

## Services

### customerService.ts

- Provides functions to interact with the backend customer API:
    - `fetchCustomers`
    - `createCustomer`
    - `deleteCustomer`
    - `updateCustomer`
    - `uploadFile`

### authService.ts

- Provides functions for authentication:
    - `login`
    - `getCurrentUser`
    - `logOut`

## Views

### LoginView.vue

- View for the login page.

### CustomersView.vue

- View for displaying and managing customers.

For more details, refer to the project description and the provided code files.