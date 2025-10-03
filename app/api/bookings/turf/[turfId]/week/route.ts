import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/app/models/Booking';
import { format, parseISO, isWithinInterval } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { turfId: string } }
) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const turfId = params.turfId;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    console.log('Fetching bookings for turf:', turfId, 'from', startDate, 'to', endDate);

    // Get all bookings (pending and confirmed) for this turf within the date range
    // We include both pending and confirmed because pending bookings should still block slots
    const bookings = await Booking.find({
      turfId,
      status: { $in: ['pending', 'confirmed'] }, // Include both pending and confirmed
      // Since slot.date is stored as Date object, we can directly compare
      'slot.date': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).select('slot');

    console.log('Found bookings:', bookings.length);
    console.log('Booking details:', bookings.map(b => ({ 
      slot: b.slot, 
      date: b.slot?.date 
    })));

    // Extract booked slots with date information
    const bookedSlots = bookings.map(booking => ({
      date: booking.slot.date ? format(booking.slot.date, 'yyyy-MM-dd') : null,
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime
    })).filter(slot => slot.date !== null); // Filter out slots without dates

    console.log('Processed booked slots:', bookedSlots);

    return NextResponse.json({
      bookedSlots,
      weekRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Error fetching booked slots for week:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}