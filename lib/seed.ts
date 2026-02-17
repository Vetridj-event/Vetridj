import User from '@/models/User';
import Booking from '@/models/Booking';
import Inventory from '@/models/Inventory';
import Finance from '@/models/Finance';
import Package from '@/models/Package';
import { INITIAL_USERS, INITIAL_BOOKINGS, INITIAL_INVENTORY, INITIAL_FINANCE, INITIAL_PACKAGES } from '@/lib/data';

export async function seedDatabase() {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        console.log('Seeding users...');
        await User.insertMany(INITIAL_USERS);
    } else {
        // Ensure admin exists if not present
        for (const initialUser of INITIAL_USERS) {
            const exists = await User.findOne({
                $or: [
                    { email: initialUser.email },
                    { phone: initialUser.phone }
                ]
            });
            if (!exists) {
                console.log(`Seeding missing user: ${initialUser.name}`);
                await User.create(initialUser);
            }
        }
    }

    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
        console.log('Seeding bookings...');
        await Booking.insertMany(INITIAL_BOOKINGS);
    }

    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
        console.log('Seeding inventory...');
        await Inventory.insertMany(INITIAL_INVENTORY);
    }

    const financeCount = await Finance.countDocuments();
    if (financeCount === 0) {
        console.log('Seeding finance records...');
        await Finance.insertMany(INITIAL_FINANCE);
    }

    const packageCount = await Package.countDocuments();
    if (packageCount === 0) {
        console.log('Seeding packages...');
        await Package.insertMany(INITIAL_PACKAGES);
    }
}
