# Authentication Setup Guide

## Overview

This application uses a comprehensive authentication system with:
- NextAuth.js for authentication management
- JWT tokens for session management
- Social login (Google & Apple)
- Email/password authentication
- React Query for state management
- Protected routes with middleware

## Features Implemented

### 1. Authentication Methods
- ✅ Email/Password registration and login
- ✅ Google OAuth integration
- ✅ Apple OAuth integration
- ✅ JWT token management
- ✅ Secure HTTP-only cookies
- ✅ Password strength validation
- ✅ Session management

### 2. Security Features
- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Refresh token rotation
- CSRF protection
- Secure cookie settings
- Input validation and sanitization

### 3. Protected Routes
Routes automatically protected by middleware:
- `/dashboard`
- `/profile`
- `/fields/claim-field-form`
- `/bookings`
- `/messages`
- `/settings`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Generate secure keys
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env.local`

### 3. Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with Sign in with Apple capability
3. Create a Service ID
4. Configure domains and redirect URLs:
   - `http://localhost:3001/api/auth/callback/apple` (development)
   - `https://yourdomain.com/api/auth/callback/apple` (production)
5. Generate a private key
6. Create client secret using the private key
7. Add credentials to `.env.local`

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user with email/password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/login`
Login with email/password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/social-login`
Handle social login callback.

#### GET `/api/auth/session`
Get current user session.

#### POST `/api/auth/signout`
Sign out current user.

## React Hooks Usage

### useAuth Hook

```typescript
import { useAuth } from '@/hooks/auth/useAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    socialLogin,
    logout
  } = useAuth();

  // Login
  const handleLogin = async () => {
    await login({
      email: 'user@example.com',
      password: 'password'
    });
  };

  // Social login
  const handleGoogleLogin = async () => {
    await socialLogin('google');
  };

  // Register
  const handleRegister = async () => {
    await register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    });
  };

  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

## Protected Pages

### Creating a Protected Page

```typescript
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
    </div>
  );
}
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Session Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Tokens are automatically refreshed when expired
- Sessions persist across browser restarts

## Security Best Practices

1. **Never expose sensitive credentials**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables for all secrets

2. **HTTPS in Production**
   - Always use HTTPS in production
   - Update cookie settings for secure flag

3. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Prevent brute force attacks

4. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage

5. **Error Handling**
   - Don't expose sensitive error details
   - Log errors server-side only

## Troubleshooting

### Common Issues

1. **"NEXTAUTH_URL is not set"**
   - Add `NEXTAUTH_URL=http://localhost:3001` to `.env.local`

2. **Google/Apple login not working**
   - Verify OAuth credentials
   - Check redirect URIs match exactly
   - Ensure APIs are enabled

3. **Session not persisting**
   - Check cookie settings
   - Verify NEXTAUTH_SECRET is set
   - Clear browser cookies and retry

4. **Middleware not protecting routes**
   - Check middleware.ts configuration
   - Verify matcher patterns
   - Restart development server

## Testing Authentication

1. **Test Registration:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
   ```

2. **Test Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!"}'
   ```

3. **Test Protected Route:**
   - Navigate to `/dashboard` without login (should redirect)
   - Login and try again (should allow access)

## Production Deployment

Before deploying to production:

1. **Update environment variables:**
   - Set production URLs
   - Use strong, unique secrets
   - Configure OAuth redirect URIs

2. **Security checklist:**
   - [ ] Enable HTTPS
   - [ ] Set secure cookie flags
   - [ ] Implement rate limiting
   - [ ] Add CSRF protection
   - [ ] Enable logging and monitoring
   - [ ] Set up error tracking

3. **Database setup:**
   - Replace in-memory storage with database
   - Set up user table with proper indexes
   - Implement data backup strategy

## Support

For issues or questions:
- Check NextAuth.js documentation: https://next-auth.js.org/
- Review security best practices: https://owasp.org/
- File issues in the project repository