import { User, Booking, InventoryItem, FinanceRecord, EventPackage } from '@/types'
import { INITIAL_USERS, INITIAL_BOOKINGS, INITIAL_INVENTORY, INITIAL_FINANCE, INITIAL_PACKAGES } from './data'

const KEYS = {
    USERS: 'vetri_users',
    BOOKINGS: 'vetri_bookings',
    INVENTORY: 'vetri_inventory',
    FINANCE: 'vetri_finance',
    PACKAGES: 'vetri_packages'
}

export const storage = {
    // Users
    getUsers: async (): Promise<User[]> => {
        try {
            const res = await fetch('/api/users')
            if (!res.ok) return []
            const data = await res.json()
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching users:', error)
            return []
        }
    },

    // Bookings
    getBookings: async (): Promise<Booking[]> => {
        try {
            const res = await fetch('/api/bookings')
            if (!res.ok) return []
            const data = await res.json()
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching bookings:', error)
            return []
        }
    },
    addBooking: async (booking: Booking) => {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        })
        return res.ok
    },
    updateBooking: async (updatedBooking: Booking) => {
        const res = await fetch('/api/bookings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBooking)
        })
        return res.ok
    },
    deleteBooking: async (id: string) => {
        const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' })
        return res.ok
    },

    // Inventory
    getInventory: async (): Promise<InventoryItem[]> => {
        try {
            const res = await fetch('/api/inventory')
            if (!res.ok) return []
            const data = await res.json()
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching inventory:', error)
            return []
        }
    },
    addInventoryItem: async (item: InventoryItem) => {
        const res = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
        return res.ok
    },
    updateInventoryItem: async (updatedItem: InventoryItem) => {
        const res = await fetch('/api/inventory', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        })
        return res.ok
    },
    deleteInventoryItem: async (id: string) => {
        const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' })
        return res.ok
    },

    // Finance
    getFinanceRecords: async (): Promise<FinanceRecord[]> => {
        try {
            const res = await fetch('/api/finance')
            if (!res.ok) return []
            const data = await res.json()
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching finance:', error)
            return []
        }
    },
    addFinanceRecord: async (record: FinanceRecord) => {
        const res = await fetch('/api/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        })
        return res.ok
    },
    updateFinanceRecord: async (updatedRecord: FinanceRecord) => {
        const res = await fetch('/api/finance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRecord)
        })
        return res.ok
    },
    deleteFinanceRecord: async (id: string) => {
        const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' })
        return res.ok
    },

    // Packages
    getPackages: async (): Promise<EventPackage[]> => {
        try {
            const res = await fetch('/api/packages')
            if (!res.ok) return []
            const data = await res.json()
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching packages:', error)
            return []
        }
    },
    setPackages: async (packages: EventPackage[]) => {
        for (const pkg of packages) {
            await fetch('/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pkg)
            })
        }
    },

    // Auth Helper
    login: async (email: string, password: string): Promise<User | null> => {
        try {
            const users = await storage.getUsers()
            if (!Array.isArray(users)) return null
            return users.find(u => u.email === email && u.password === password) || null
        } catch (error) {
            console.error('Login storage error:', error)
            return null
        }
    }
}
