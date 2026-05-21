# Admin Portal Frontend

This is the frontend application for the Admin Portal, built using Next.js. It includes user authentication features and a dashboard for managing users.

## Project Structure

- **src/pages**: Contains the main pages of the application.
  - **_app.tsx**: Custom App component for initializing pages.
  - **index.tsx**: Main landing page of the admin portal.
  - **login.tsx**: Login page for user authentication.
  - **dashboard.tsx**: Dashboard page for authenticated users.

- **src/components**: Contains reusable components.
  - **Header.tsx**: Navigation and branding component.
  - **ProtectedRoute.tsx**: Component to protect routes that require authentication.

- **src/lib**: Contains utility functions.
  - **auth.ts**: Functions for handling authentication (login, logout, etc.).

- **src/styles**: Contains global styles.
  - **globals.css**: Global CSS styles for the application.

## Getting Started

1. **Installation**: Run `npm install` to install the necessary dependencies.
2. **Development**: Use `npm run dev` to start the development server.
3. **Build**: Use `npm run build` to create an optimized production build.
4. **Start**: Use `npm start` to start the production server.

## Authentication

This application includes user authentication using a username and password. The login page allows users to enter their credentials, and upon successful authentication, they are redirected to the dashboard.

## Deployment

The frontend application can be deployed separately from the backend authentication service. Ensure that the environment variables are set correctly for production.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.