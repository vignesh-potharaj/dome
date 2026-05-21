# Admin Portal

This project is an admin portal that includes user authentication features. It is structured into two main applications: a frontend application built with Next.js and an authentication service.

## Project Structure

- **apps/**
  - **frontend/**: The frontend application that provides the user interface for the admin portal.
  - **auth-service/**: The backend service that handles user authentication and management.

## Frontend Application

The frontend application is built using Next.js and includes the following key features:

- **User Authentication**: Users can log in using their username and password.
- **Protected Routes**: Certain pages are accessible only to authenticated users.
- **Dashboard**: After logging in, users are redirected to a dashboard that displays relevant information.

### Key Files

- **`apps/frontend/package.json`**: Contains dependencies and scripts for the frontend application.
- **`apps/frontend/src/pages/login.tsx`**: The login page for user authentication.
- **`apps/frontend/src/pages/dashboard.tsx`**: The dashboard page for authenticated users.
- **`apps/frontend/src/lib/auth.ts`**: Contains authentication-related functions.

## Authentication Service

The authentication service is responsible for managing user authentication and includes the following features:

- **Login and Registration**: Endpoints for user login and registration.
- **User Management**: Functions for creating and retrieving user data.

### Key Files

- **`apps/auth-service/src/routes/auth.ts`**: Defines authentication routes.
- **`apps/auth-service/src/controllers/authController.ts`**: Handles authentication logic.
- **`apps/auth-service/src/services/userService.ts`**: Manages user data.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Navigate to the `apps/frontend` directory and install dependencies:
   ```
   npm install
   ```
3. Navigate to the `apps/auth-service` directory and install dependencies:
   ```
   npm install
   ```
4. Start the frontend application:
   ```
   npm run dev
   ```
5. Start the authentication service:
   ```
   npm start
   ```

## Deployment

The frontend application and the authentication service can be deployed separately. Ensure that the authentication service is running before accessing the frontend application.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.