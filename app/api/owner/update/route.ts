import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/app/models/User';

// Temporarily removed Firebase Admin SDK to debug connection issues
console.log('Firebase Admin not initialized, skipping token verification for development');

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let uid: string;
    // Temporarily always use fallback for development
    console.log('Using development mode - skipping Firebase Admin token verification');
    console.log('Raw token:', idToken.substring(0, 50) + '...');
    try {
      const [, payload] = idToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      uid = decoded.uid || decoded.user_id || 'test-uid-' + Date.now();
      console.log('Decoded UID from token:', uid);
      console.log('Decoded email from token:', decoded.email);
    } catch (error) {
      console.error('Error parsing token payload:', error);
      uid = 'fallback-uid-' + Date.now();
      console.log('Using fallback UID:', uid);
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user
    const user = await User.findOne({ uid });
    console.log('User lookup result:', user ? 'Found user' : 'User not found');
    console.log('Looking for UID:', uid);
    
    if (!user) {
      // Let's also try to find any users with similar UIDs or emails
      const allUsers = await User.find({}, { uid: 1, email: 1, name: 1 }).limit(5);
      console.log('Available users in database:', allUsers);
      return NextResponse.json(
        { error: 'User not found', debug: { searchedUID: uid, availableUsers: allUsers } },
        { status: 404 }
      );
    }

    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'User is not an owner' },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const {
      businessName,
      phone,
      upiQrCode,
      turfImages,
      sportsOffered,
      customSport,
      amenities,
      about,
      availableSlots,
      pricing,
      location
    } = body;

    // Validate required fields for owners
    if (!upiQrCode || !upiQrCode.url || !upiQrCode.public_id) {
      return NextResponse.json(
        { error: 'UPI QR code is required' },
        { status: 400 }
      );
    }

    if (!turfImages || !Array.isArray(turfImages) || turfImages.length === 0) {
      return NextResponse.json(
        { error: 'At least one turf image is required' },
        { status: 400 }
      );
    }

    if (!sportsOffered || !Array.isArray(sportsOffered) || sportsOffered.length === 0) {
      return NextResponse.json(
        { error: 'At least one sport must be selected' },
        { status: 400 }
      );
    }

    if (sportsOffered.includes('Other') && (!customSport || customSport.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Custom sport name is required when "Other" is selected' },
        { status: 400 }
      );
    }

    if (!about || about.trim().length === 0) {
      return NextResponse.json(
        { error: 'About section is required' },
        { status: 400 }
      );
    }

    if (!availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
      return NextResponse.json(
        { error: 'At least one time slot is required' },
        { status: 400 }
      );
    }

    if (!pricing || pricing <= 0) {
      return NextResponse.json(
        { error: 'Valid pricing is required' },
        { status: 400 }
      );
    }

    // Validate time slots format
    for (const slot of availableSlots) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return NextResponse.json(
          { error: 'Invalid time slot format' },
          { status: 400 }
        );
      }
      
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return NextResponse.json(
          { error: 'Invalid time format. Use HH:MM format' },
          { status: 400 }
        );
      }
    }

    // Update user with owner-specific fields
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        businessName,
        phone,
        upiQrCode,
        turfImages,
        sportsOffered,
        customSport: sportsOffered.includes('Other') ? customSport : undefined,
        amenities: amenities || [],
        about,
        availableSlots,
        pricing,
        location: location || {}
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Owner profile updated successfully',
      user: {
        _id: updatedUser._id,
        uid: updatedUser.uid,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        businessName: updatedUser.businessName,
        phone: updatedUser.phone,
        upiQrCode: updatedUser.upiQrCode,
        turfImages: updatedUser.turfImages,
        sportsOffered: updatedUser.sportsOffered,
        customSport: updatedUser.customSport,
        amenities: updatedUser.amenities,
        about: updatedUser.about,
        availableSlots: updatedUser.availableSlots,
        pricing: updatedUser.pricing,
        location: updatedUser.location,
        emailVerified: updatedUser.emailVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating owner profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let uid: string;
    // Temporarily always use fallback for development
    console.log('GET request - Using development mode - skipping Firebase Admin token verification');
    console.log('GET request - Raw token:', idToken.substring(0, 50) + '...');
    try {
      const [, payload] = idToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      uid = decoded.uid || decoded.user_id || 'test-uid-' + Date.now();
      console.log('GET request - Decoded UID from token:', uid);
      console.log('GET request - Decoded email from token:', decoded.email);
    } catch (error) {
      console.error('GET request - Error parsing token payload:', error);
      uid = 'fallback-uid-' + Date.now();
      console.log('GET request - Using fallback UID:', uid);
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user
    const user = await User.findOne({ uid });
    console.log('GET request - User lookup result:', user ? 'Found user' : 'User not found');
    console.log('GET request - Looking for UID:', uid);
    
    if (!user) {
      // Let's also try to find any users with similar UIDs or emails
      const allUsers = await User.find({}, { uid: 1, email: 1, name: 1 }).limit(5);
      console.log('GET request - Available users in database:', allUsers);
      return NextResponse.json(
        { error: 'User not found', debug: { searchedUID: uid, availableUsers: allUsers } },
        { status: 404 }
      );
    }

    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'User is not an owner' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        phone: user.phone,
        upiQrCode: user.upiQrCode,
        turfImages: user.turfImages,
        sportsOffered: user.sportsOffered,
        customSport: user.customSport,
        amenities: user.amenities,
        about: user.about,
        availableSlots: user.availableSlots,
        pricing: user.pricing,
        location: user.location,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching owner profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}