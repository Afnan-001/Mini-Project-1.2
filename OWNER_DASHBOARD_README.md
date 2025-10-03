# Owner Dashboard Setup Guide

## 🎯 Overview

The Owner Dashboard is a comprehensive management system for turf owners to manage their business profile, upload images, set pricing, manage time slots, and more.

## 📋 Features Implemented

### ✅ Extended User Schema
- **UPI QR Code**: Cloudinary-based image upload for payment QR codes
- **Turf Images**: Multiple image upload (up to 10 images)
- **Sports Selection**: Predefined sports + custom "Other" option
- **Amenities**: Multi-select amenities (Floodlights, Parking, Washroom, Equipment)
- **About Section**: Rich text description (max 1000 characters)
- **Time Slots**: Dynamic slot management with day/time validation
- **Pricing**: Hourly rate setting
- **Location**: Address, city, state, pincode fields

### ✅ Component Architecture
- **UpiUploader**: Single image upload with drag-and-drop
- **TurfImagesUploader**: Multiple image upload with grid display
- **SportsSelection**: Sports selection with custom option
- **AmenitiesSelector**: Checkbox-based amenities selection
- **AboutSection**: Textarea with character count
- **SlotManager**: Dynamic time slot creation/management

### ✅ API Integration
- **PUT /api/owner/update**: Save owner profile data
- **GET /api/owner/update**: Load existing owner data
- Firebase Admin SDK authentication
- MongoDB integration with Mongoose validation

### ✅ Dashboard Features
- **Tabbed Interface**: Organized into Business Info, Turf Details, Scheduling, Location
- **Real-time Validation**: Form validation with error messages
- **Loading States**: Loading indicators for async operations
- **Success/Error Feedback**: User-friendly status messages
- **Mobile Responsive**: Optimized for all screen sizes

## 🔧 Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Firebase Admin SDK (for server-side auth)
FIREBASE_PROJECT_ID=mini-project-1-2ad92
FIREBASE_CLIENT_EMAIL=your_service_account_email@mini-project-1-2ad92.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
```

### 2. Cloudinary Setup
1. Create a [Cloudinary account](https://cloudinary.com/)
2. Go to your Dashboard
3. Create an upload preset named `turf_booking`:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Preset name: `turf_booking`
   - Signing mode: `Unsigned`
   - Save the preset
4. Copy your Cloud Name to the environment variable

### 3. Firebase Admin Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the required fields to environment variables:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`  
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 4. Enable Firebase Authentication
1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Go to Sign-in method tab
4. Enable "Email/Password" provider
5. Save changes

## 🚀 Usage Guide

### Accessing the Dashboard
1. Register as an owner or login with owner credentials
2. Navigate to `/dashboard/turf-owner`
3. Complete your profile across all tabs

### Tab Breakdown

#### **Business Info**
- Basic business information (name, phone)
- Hourly pricing configuration
- UPI QR code upload for payments

#### **Turf Details**  
- Upload multiple turf images (max 10)
- Select available sports + custom sport option
- Choose amenities offered
- Write compelling turf description

#### **Scheduling**
- Add time slots for each day of the week
- Automatic overlap detection
- Visual schedule display by day

#### **Location**
- Complete address information
- City, state, pincode details

### Validation Rules
- **Required Fields**: Business name, phone, UPI QR code, at least 1 turf image, at least 1 sport, about section, at least 1 time slot, valid pricing
- **Image Limits**: Max 5MB per image, 10 images total for turf
- **Time Validation**: End time must be after start time, no overlapping slots
- **Custom Sports**: Required when "Other" is selected

## 🔒 Security Features
- Firebase ID token authentication for all API calls
- Owner role verification on backend
- Mongoose schema validation
- Input sanitization and validation

## 📱 Mobile Responsiveness
- Responsive grid layouts
- Touch-friendly upload areas
- Optimized for tablets and phones
- Collapsible sections on small screens

## 🐛 Troubleshooting

### Common Issues

1. **Cloudinary Upload Fails**
   - Check if upload preset `turf_booking` exists
   - Verify cloud name in environment variables
   - Ensure preset is set to "Unsigned"

2. **Authentication Errors**
   - Verify Firebase Admin SDK credentials
   - Check if private key has proper newline formatting
   - Ensure user has "owner" role in database

3. **Image Upload Size Issues**
   - Max file size is 5MB per image
   - Only image files are accepted
   - Check browser console for detailed errors

4. **Time Slot Validation**
   - End time must be after start time
   - No overlapping slots on same day
   - Use HH:MM format (24-hour)

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in Developer Tools
3. Check server logs for API errors
4. Validate environment variables are loaded

## 🎨 Customization

### Styling
- Uses Tailwind CSS for responsive design
- shadcn/ui components for consistent UI
- Easy to customize color schemes in component files

### Adding New Fields
1. Update User schema in `app/models/User.ts`
2. Add field to API route validation
3. Create new component in `components/owner/`
4. Integrate into main dashboard

### Component Reusability
All components are designed to be reusable:
- Pass data via props
- Handle state updates via callbacks
- Consistent error handling patterns

## 📈 Future Enhancements

### Planned Features
- **Analytics Dashboard**: Booking statistics and revenue tracking
- **Calendar Integration**: Visual booking calendar
- **Customer Reviews**: Review management system
- **Pricing Tiers**: Dynamic pricing based on time/day
- **Bulk Operations**: Batch slot creation
- **Image Optimization**: Automatic image compression
- **Location Services**: Map integration for address selection

### Performance Optimizations
- Image lazy loading
- Infinite scroll for large datasets
- Caching strategies for frequently accessed data
- Background upload processing

---

## 🎉 Success! 

Your comprehensive Owner Dashboard is now ready! Owners can:
- ✅ Upload and manage UPI QR codes
- ✅ Upload multiple turf images  
- ✅ Configure sports and amenities
- ✅ Write detailed descriptions
- ✅ Manage time slots dynamically
- ✅ Set pricing and location details
- ✅ Save everything to MongoDB via secure APIs

The dashboard is fully mobile-responsive and production-ready! 🚀