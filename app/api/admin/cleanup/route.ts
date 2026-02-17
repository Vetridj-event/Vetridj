import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Finance from '@/models/Finance';
import Inventory from '@/models/Inventory';
import Package from '@/models/Package';
import AuditLog from '@/models/AuditLog';

export async function POST(request: Request) {
    try {
        const conn = await dbConnect();
        const db = conn.connection.db;

        // 1. Delete all bookings
        await Booking.deleteMany({});

        // 2. Delete all finance records
        await Finance.deleteMany({});

        // 3. Delete all users except ADMIN
        await User.deleteMany({ role: { $ne: 'ADMIN' } });

        // 4. Delete all inventory items
        await Inventory.deleteMany({});

        // 5. Delete all packages
        await Package.deleteMany({});

        // 6. Delete all audit logs
        await AuditLog.deleteMany({});

        // 7. Delete product requests (direct collection)
        if (db) {
            await db.collection('product_requests').deleteMany({});
        }

        return NextResponse.json({
            message: 'System data cleared successfully. Admin account and system settings preserved.'
        });
    } catch (error: any) {
        console.error('Cleanup Error:', error);
        return NextResponse.json({
            error: 'Failed to clear data',
            details: error.message
        }, { status: 500 });
    }
}
