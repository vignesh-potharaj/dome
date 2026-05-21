# Authentication Service

This directory contains the authentication service for the admin portal. It is responsible for handling user authentication, including login and registration functionalities.

## Project Structure

- **src/**: Contains the source code for the authentication service.
  - **index.ts**: Entry point for the authentication service.
  - **routes/**: Contains route definitions for authentication.
    - **auth.ts**: Defines authentication-related routes.
  - **controllers/**: Contains the logic for handling requests.
    - **authController.ts**: Manages authentication logic.
  - **services/**: Contains business logic related to user management.
    - **userService.ts**: Handles user data operations.
  - **middleware/**: Contains middleware functions for authentication checks.
    - **authMiddleware.ts**: Middleware for protecting routes.
  - **types/**: Contains TypeScript type definitions.
    - **index.d.ts**: Type definitions used throughout the service.

## Installation

To install the dependencies for the authentication service, run:

```
npm install
```

## Running the Service

To start the authentication service, use the following command:

```
npm start
```

## API Endpoints

- **POST /auth/login**: Authenticates a user and returns a token.
- **POST /auth/register**: Registers a new user.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.