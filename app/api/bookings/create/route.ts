import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/app/models/Booking';
import User from '@/app/models/User';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    const ownerId = formData.get('ownerId') as string;
    const turfId = formData.get('turfId') as string;
    const slotData = formData.get('slot') as string;
    const totalAmount = formData.get('totalAmount') as string;
    const paymentScreenshot = formData.get('paymentScreenshot') as File;

    // Validate required fields
    if (!customerId || !ownerId || !turfId || !slotData || !totalAmount || !paymentScreenshot) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Parse slot data
    let slot;
    try {
      slot = JSON.parse(slotData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid slot data format' },
        { status: 400 }
      );
    }

    // Validate slot structure
    if (!slot.day || !slot.startTime || !slot.endTime) {
      return NextResponse.json(
        { error: 'Slot must contain day, startTime, and endTime' },
        { status: 400 }
      );
    }

    // Verify that the customer, owner, and turf exist
    const [customer, owner, turf] = await Promise.all([
      User.findById(customerId),
      User.findById(ownerId),
      User.findById(turfId)
    ]);

    if (!customer || customer.role !== 'customer') {
      return NextResponse.json(
        { error: 'Invalid customer' },
        { status: 400 }
      );
    }

    if (!owner || owner.role !== 'owner') {
      return NextResponse.json(
        { error: 'Invalid turf owner' },
        { status: 400 }
      );
    }

    if (!turf || turf.role !== 'owner') {
      return NextResponse.json(
        { error: 'Invalid turf' },
        { status: 400 }
      );
    }

    // Check if the slot is available
    const existingBooking = await Booking.findOne({
      turfId,
      'slot.day': slot.day,
      'slot.startTime': slot.startTime,
      'slot.endTime': slot.endTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This slot is no longer available' },
        { status: 409 }
      );
    }

    // Upload payment screenshot to Cloudinary
    const bytes = await paymentScreenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'arenax/payment-screenshots',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    // Create the booking
    const booking = new Booking({
      customerId,
      ownerId,
      turfId,
      slot,
      totalAmount: parseFloat(totalAmount),
      paymentScreenshot: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    });

    await booking.save();

    // Populate the booking with user and turf details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('ownerId', 'name email businessName')
      .populate('turfId', 'businessName location pricing');

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: populatedBooking
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}