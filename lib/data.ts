import { User, Booking, InventoryItem, FinanceRecord, EventPackage } from '@/types'

export const INITIAL_USERS: User[] = [
    {
        id: 'admin-1',
        name: 'Vetri Admin',
        email: 'admin@vetridj.com',
        password: 'admin', // Mock password
        role: 'ADMIN',
        joinedDate: new Date().toISOString(),
        phone: '+91 98765 43210'
    }
]

export const INITIAL_PACKAGES: EventPackage[] = [
    {
        id: 'pkg-1',
        name: 'Standard DJ Setup',
        price: 15000,
        features: ['Professional JBL Speakers', '4 Hours DJ Service', 'Basic Lighting', 'Wireless Mic']
    },
    {
        id: 'pkg-2',
        name: 'Deluxe DJ Experience',
        price: 25000,
        features: ['Premium Sound System', '6 Hours DJ Service', 'Smoke & Fog', 'Moving Heads'],
        isPopular: true
    },
    {
        id: 'pkg-3',
        name: 'Royal Event Package',
        price: 40000,
        features: ['Ultimate Audio Setup', '8 Hours Service', 'LED Wall', 'Pyrotechnics']
    }
]

export const INITIAL_INVENTORY: InventoryItem[] = []

export const INITIAL_BOOKINGS: Booking[] = []

export const INITIAL_FINANCE: FinanceRecord[] = []

