import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    try {
        const eventsRun = await Booking.countDocuments();

        // Get unique customer names from bookings
        const uniqueCustomers = await Booking.distinct('customerName');
        const happyClients = uniqueCustomers.length;

        const crewMembers = await User.countDocuments({ role: 'CREW' });

        return NextResponse.json({
            eventsRun,
            happyClients,
            crewMembers
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
