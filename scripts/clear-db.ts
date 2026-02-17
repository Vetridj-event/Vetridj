import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Booking from '../models/Booking';
import Inventory from '../models/Inventory';
import Finance from '../models/Finance';
import Package from '../models/Package';
import fs from 'fs';
import path from 'path';

// Manually load .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const envVars = Object.fromEntries(
    envFile.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
);

if (envVars.MONGODB_URI) {
    process.env.MONGODB_URI = envVars.MONGODB_URI;
}

async function clearDatabase() {
    await dbConnect();
    console.log('Connecting to database...');

    console.log('Clearing Bookings...');
    await Booking.deleteMany({});

    console.log('Clearing Inventory...');
    await Inventory.deleteMany({});

    console.log('Clearing Finance...');
    await Finance.deleteMany({});

    // For Users, we might want to keep the admin but clear others
    // Or just clear all if the user wants a TOTAL reset
    // Given the request "Remove all data", I'll clear all except the admin email in env
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vetridj.com';
    console.log(`Clearing Users (keeping ${adminEmail})...`);
    await User.deleteMany({ email: { $ne: adminEmail } });

    console.log('Database cleared!');
    process.exit(0);
}

clearDatabase().catch(err => {
    console.error(err);
    process.exit(1);
});
