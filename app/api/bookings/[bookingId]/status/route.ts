import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/app/models/Booking';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectMongoDB();

    const { bookingId } = params;
    const { status } = await request.json();

    console.log('Updating booking status:', { bookingId, status });

    // Validate status
    if (!status || !['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "confirmed" or "rejected"' },
        { status: 400 }
      );
    }

    // Find and update the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is still pending
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking has already been processed' },
        { status: 400 }
      );
    }

    // Update the booking status
    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    console.log('Booking status updated successfully');

    // Return the updated booking with populated data
    const updatedBooking = await Booking.findById(bookingId)
      .populate('customerId', 'name email phone uid')
      .populate('ownerId', 'name email businessName')
      .populate('turfId', 'name description location pricing');

    return NextResponse.json({
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}