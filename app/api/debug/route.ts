import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Get all users and their UIDs
    const users = await User.find({}, { uid: 1, email: 1, name: 1, role: 1 }).limit(10);
    
    return NextResponse.json({
      message: 'Debug info',
      totalUsers: users.length,
      users: users.map(user => ({
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role
      }))
    });

  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}