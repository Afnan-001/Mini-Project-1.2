import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import Turf from '@/app/models/Turf';

export async function POST(request: NextRequest) {
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
    
    // Verify the Firebase ID token and get UID
    let uid: string;
    let email: string;
    try {
      const [, payload] = idToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      uid = decoded.uid || decoded.user_id;
      email = decoded.email;
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user
    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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
      name,
      description,
      images,
      sportsOffered,
      customSport,
      amenities,
      availableSlots,
      pricing,
      location,
      upiQrCode
    } = body;

    // Validate required fields
    if (!name || !description || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Name, description, and at least one image are required' },
        { status: 400 }
      );
    }

    if (!sportsOffered || sportsOffered.length === 0) {
      return NextResponse.json(
        { error: 'At least one sport must be selected' },
        { status: 400 }
      );
    }

    if (!availableSlots || availableSlots.length === 0) {
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

    if (!upiQrCode || !upiQrCode.url) {
      return NextResponse.json(
        { error: 'UPI QR code is required' },
        { status: 400 }
      );
    }

    // Check if user already has a turf
    const existingTurf = await Turf.findOne({ ownerUid: uid });
    if (existingTurf) {
      return NextResponse.json(
        { error: 'User already has a turf registered. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create new turf
    const newTurf = new Turf({
      ownerId: user._id,
      ownerUid: uid,
      name,
      description,
      images,
      featuredImage: images[0].url, // First image as featured
      sportsOffered,
      customSport: sportsOffered.includes('Other') ? customSport : undefined,
      amenities: amenities || [],
      availableSlots,
      pricing,
      location: location || {},
      contactInfo: {
        phone: user.phone || '',
        email: user.email,
        businessName: user.businessName || name
      },
      paymentInfo: {
        upiQrCode
      },
      isActive: true
    });

    await newTurf.save();

    return NextResponse.json({
      message: 'Turf created successfully',
      turf: newTurf
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating turf:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

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
    
    // Verify the Firebase ID token and get UID
    let uid: string;
    try {
      const [, payload] = idToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      uid = decoded.uid || decoded.user_id;
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user and their turf
    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'User is not an owner' },
        { status: 403 }
      );
    }

    const existingTurf = await Turf.findOne({ ownerUid: uid });
    if (!existingTurf) {
      return NextResponse.json(
        { error: 'Turf not found. Use POST to create a new turf.' },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await request.json();
    const {
      name,
      description,
      images,
      sportsOffered,
      customSport,
      amenities,
      availableSlots,
      pricing,
      location,
      upiQrCode
    } = body;

    // Update turf
    const updatedTurf = await Turf.findOneAndUpdate(
      { ownerUid: uid },
      {
        name,
        description,
        images,
        featuredImage: images && images.length > 0 ? images[0].url : existingTurf.featuredImage,
        sportsOffered,
        customSport: sportsOffered && sportsOffered.includes('Other') ? customSport : undefined,
        amenities: amenities || [],
        availableSlots,
        pricing,
        location: location || {},
        contactInfo: {
          phone: user.phone || existingTurf.contactInfo.phone,
          email: user.email,
          businessName: user.businessName || name || existingTurf.contactInfo.businessName
        },
        paymentInfo: {
          upiQrCode: upiQrCode || existingTurf.paymentInfo.upiQrCode
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Turf updated successfully',
      turf: updatedTurf
    });

  } catch (error: any) {
    console.error('Error updating turf:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
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
    
    // Verify the Firebase ID token and get UID
    let uid: string;
    try {
      const [, payload] = idToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      uid = decoded.uid || decoded.user_id;
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user's turf
    const turf = await Turf.findOne({ ownerUid: uid }).populate('ownerId');
    
    if (!turf) {
      return NextResponse.json(
        { error: 'Turf not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      turf
    });

  } catch (error: any) {
    console.error('Error fetching turf:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}