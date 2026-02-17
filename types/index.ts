export type Role = 'ADMIN' | 'CREW' | 'CUSTOMER'

export interface User {
    id: string
    name: string
    email?: string
    password?: string // In a real app, this would be hashed. For mock, we might simulate it.
    role: Role
    phone?: string
    whatsapp?: string
    pincode?: string
    city?: string
    state?: string
    joinedDate: string
    avatar?: string
    salary?: number
}

export interface Booking {
    id: string
    customerName: string
    customerPhone?: string
    customerEmail?: string
    eventType: string // e.g., 'Wedding', 'Birthday'
    date: string
    packageId?: string
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
    amount: number
    advanceAmount?: number
    receivedAmount?: number
    balanceAmount?: number
    location?: string
    customerId?: string // Reference to User ID
    crewAssigned?: string[] // Array of User IDs
    notes?: string
    checkInTime?: { [crewId: string]: string }
    djPackage?: string
    additionalNotes?: string
    paymentRequested?: boolean
}

export interface InventoryItem {
    id: string
    name: string
    category: string // e.g., 'Sound', 'Lighting', 'Cables'
    quantity: number // Available quantity
    totalQuantity: number
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'
    lastChecked?: string
}

export interface FinanceRecord {
    id: string
    type: 'INCOME' | 'EXPENSE'
    amount: number
    category: string // e.g., 'Booking Payment', 'Salary', 'Equipment Repair'
    date: string
    description: string
    relatedBookingId?: string
}

export interface EventPackage {
    id: string
    name: string
    price: number
    features: string[]
    isPopular?: boolean
}

export interface ProductRequest {
    id: string
    crewId: string
    crewName: string
    productName: string
    requirements: string
    quantity: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    date: string
}
