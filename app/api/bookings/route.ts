import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { seedDatabase } from '@/lib/seed';
import { logAction } from '@/lib/audit-logger';

export async function GET(request: Request) {
    await dbConnect();
    await seedDatabase();
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');

        const filter = customerId ? { customerId } : {};
        const bookings = await Booking.find(filter).sort({ date: -1 });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const booking = await Booking.create(body);
        await logAction('ADMIN', 'CREATE', 'BOOKING', booking.id, `Booking created for ${booking.customerName}`);
        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { id, ...updateData } = body;
        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        await logAction('ADMIN', 'UPDATE', 'BOOKING', id, `Booking status: ${booking.status}`);
        return NextResponse.json(booking);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        await logAction('ADMIN', 'DELETE', 'BOOKING', id, `Booking deleted: ${booking.customerName}`);
        return NextResponse.json({ message: 'Booking deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
