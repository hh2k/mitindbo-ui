# Mit Indbo UI

Modern Angular application for managing inventory items.

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or higher)
- npm (v9 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Features

- **Auth0 Integration**: Secure authentication using Auth0
- Modern, responsive login page
- Authentication service with Auth0 token management
- Route guards for protected pages
- Automatic token injection for API calls
- Clean, minimal design with smooth animations
- Danish language support

## Development

The app is built with:
- Angular 21 (latest)
- TypeScript 5.9+
- SCSS for styling
- Standalone components

### Requirements
- Node.js 20.19.0 or higher
- TypeScript 5.9.0 or higher

## Auth0 Configuration

The application is configured to use Auth0 for authentication. The configuration is stored in `src/environments/environment.ts`:

- **Domain**: `dev-mit-indbo.eu.auth0.com`
- **Client ID**: Configured in environment files
- **Audience**: `mit-indbo-backend` (for API access)

### Auth0 Setup

1. Make sure your Auth0 application is configured with the correct callback URLs:
   - Allowed Callback URLs: `http://localhost:4200`
   - Allowed Logout URLs: `http://localhost:4200`
   - Allowed Web Origins: `http://localhost:4200`

2. The Auth0 SDK automatically handles:
   - Login redirects
   - Token storage
   - Token refresh
   - HTTP interceptor for API calls

## Backend API

The application connects to the backend API at `http://127.0.0.1:8000`. The Auth0 HTTP interceptor automatically adds the Bearer token to all API requests. Make sure your backend server is running and configured to accept Auth0 JWT tokens.

