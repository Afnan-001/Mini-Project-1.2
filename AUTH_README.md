# TurfBook Authentication System

## Overview

This project implements a complete authentication system using Firebase Authentication integrated with MongoDB for user profile management. The system supports role-based access control with email verification requirements.

## Features Implemented

### ✅ Authentication Flow
- **Firebase Authentication** for secure user management
- **Email + Password** registration and login
- **Email verification** required before login
- **MongoDB integration** for user profile storage
- **Role-based user system** (Customer/Owner)

### ✅ User Roles
- **Customer**: Regular users who book turfs
- **Owner**: Turf facility owners who manage their properties

### ✅ Protected Routes
- Role-based access control using middleware
- Customers cannot access owner dashboard
- Owners have access to management features
- Session persistence across page refreshes

### ✅ User Interface
- **Registration pages** with role selection
- **Login system** with error handling
- **Email verification** page with resend functionality
- **Owner Dashboard** with placeholder statistics
- **Profile setup** for missing MongoDB users

## File Structure

```
├── app/
│   ├── auth/
│   │   ├── login/page.tsx              # Login page
│   │   ├── register/page.tsx           # Registration with role selection
│   │   ├── verify-email/page.tsx       # Email verification page
│   │   └── profile-setup/page.tsx      # Profile completion page
│   ├── dashboard/
│   │   └── turf-owner/page.tsx         # Owner dashboard
│   ├── owner/
│   │   └── dashboard/page.tsx          # Alternative owner dashboard
│   ├── api/
│   │   └── users/route.ts              # User CRUD API
│   ├── models/
│   │   └── User.ts                     # MongoDB User schema
│   └── layout.tsx                      # Root layout with AuthProvider
├── components/
│   ├── ProtectedRoute.tsx              # Route protection component
│   └── landing/
│       └── LandingHeader.tsx           # Header with auth state
├── contexts/
│   └── AuthContext.tsx                 # Authentication context
└── lib/
    ├── firebase.ts                     # Firebase configuration
    └── mongodb.ts                      # MongoDB connection
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/turf_booking

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password provider
3. Enable Email/Password sign-in method
4. Configure authorized domains for your application
5. Copy configuration values to `.env.local`

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/your/db
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Add to MONGODB_URI in `.env.local`

### 4. Install Dependencies

```bash
npm install
# Dependencies are already included in package.json
```

### 5. Run the Application

```bash
npm run dev
```

## Database Schema

### Users Collection (MongoDB)

```typescript
{
  _id: ObjectId,
  uid: String,                    // Firebase UID
  name: String,                   // User's full name
  email: String,                  // Email address
  role: "customer" | "owner",     // User role
  phone: String,                  // Phone number (optional)
  businessName: String,           // Business name (owners only)
  emailVerified: Boolean,         // Email verification status
  isActive: Boolean,              // Account status
  createdAt: Date,               // Registration date
  updatedAt: Date                // Last updated
}
```

## API Endpoints

### POST /api/users
Create a new user in MongoDB after Firebase registration.

**Request Body:**
```json
{
  "uid": "firebase_uid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "phone": "+1234567890",
  "businessName": "Optional for owners"
}
```

### GET /api/users?uid=firebase_uid
Get user data by Firebase UID.

### GET /api/users?email=user@email.com
Get user data by email address.

### PATCH /api/users
Update user data.

**Request Body:**
```json
{
  "uid": "firebase_uid",
  "emailVerified": true
}
```

## Authentication Flow

### Registration Flow

1. User fills registration form with role selection
2. Firebase creates user account
3. Email verification is sent
4. MongoDB user document is created
5. User redirected to email verification page
6. After email verification, user can login

### Login Flow

1. User enters email/password
2. Firebase validates credentials
3. Check if email is verified (blocks login if not)
4. Fetch user role from MongoDB
5. Redirect based on role:
   - Customer → `/` (home page)
   - Owner → `/dashboard/turf-owner`

### Session Management

- Firebase handles authentication state
- AuthContext syncs Firebase user with MongoDB data
- Automatic redirect on role-based routes
- Session persists across page refreshes

## Protected Routes Usage

```tsx
// Protect entire page
export default function OwnerDashboard() {
  return (
    <ProtectedRoute requireRole="owner">
      <YourComponent />
    </ProtectedRoute>
  );
}

// Or use HOC
export default withProtectedRoute(YourComponent, {
  requireRole: "owner",
  requireEmailVerified: true
});
```

## Development Notes

### AuthContext Hook Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user,              // MongoDB user with role
    firebaseUser,      // Firebase user
    login,             // Login function
    register,          // Register function
    logout,            // Logout function
    loading,           // Loading state
    isOwner,           // Role check
    isCustomer,        // Role check
    isEmailVerified    // Email verification check
  } = useAuth();
}
```

### Error Handling

- All authentication errors are caught and displayed to users
- Network errors are handled gracefully
- Email verification status is checked before allowing login
- MongoDB sync errors are logged and handled

### Security Features

- Email verification required
- Firebase security rules (implement in Firebase console)
- Input validation on both client and server
- Protected API routes
- Role-based access control

## Next Steps for Enhancement

1. **Add password reset functionality**
2. **Implement social login (Google, Facebook)**
3. **Add profile picture upload**
4. **Create admin role and admin dashboard**
5. **Add audit logging for user actions**
6. **Implement 2FA (Two-Factor Authentication)**
7. **Add user preference settings**
8. **Create user activity tracking**

## Troubleshooting

### Common Issues

1. **Firebase Config Error**: Ensure all Firebase environment variables are set
2. **MongoDB Connection**: Check MONGODB_URI format and network connectivity
3. **Email Verification**: Check Firebase console for email template configuration
4. **Role Redirect Loop**: Ensure MongoDB user document exists with correct role

### Debug Tips

- Check browser console for client-side errors
- Check server logs for API errors
- Verify Firebase authentication in Firebase console
- Check MongoDB documents in database

## Testing the System

### Manual Testing Steps

1. **Registration Test**:
   - Register as customer and owner
   - Verify email verification is sent
   - Check MongoDB document creation

2. **Login Test**:
   - Try login before email verification (should fail)
   - Verify email and login
   - Check role-based redirection

3. **Access Control Test**:
   - Try accessing owner dashboard as customer
   - Verify proper redirects and error messages

4. **Session Persistence Test**:
   - Login and refresh page
   - Verify user stays logged in
   - Check auth state persistence

This authentication system provides a solid foundation for a multi-role application with proper security measures and user experience considerations.