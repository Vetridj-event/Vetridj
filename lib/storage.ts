import { User, Booking, InventoryItem, FinanceRecord, EventPackage, ProductRequest } from '@/types'
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
    addUser: async (user: User) => {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
        return res.ok
    },
    updateUser: async (user: User) => {
        const res = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
        return res.ok
    },
    deleteUser: async (id: string) => {
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
        return res.ok
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
    addPackage: async (pkg: EventPackage) => {
        const res = await fetch('/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pkg)
        })
        return res.ok
    },
    updatePackage: async (pkg: EventPackage) => {
        const res = await fetch('/api/packages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pkg)
        })
        return res.ok
    },
    deletePackage: async (id: string) => {
        const res = await fetch(`/api/packages?id=${id}`, { method: 'DELETE' })
        return res.ok
    },
    // Keep for one-time initialization if needed, but avoid for updates
    setPackages: async (packages: EventPackage[]) => {
        for (const pkg of packages) {
            await storage.addPackage(pkg)
        }
    },

    // Auth Helper
    login: async (identifier: string, password: string): Promise<User | null> => {
        try {
            const users = await storage.getUsers()
            if (!Array.isArray(users)) return null

            const isPhone = /^\+?[\d\s-]{10,}$/.test(identifier) && !identifier.includes('@')
            const normalize = (p: string) => {
                const d = p.replace(/\D/g, '')
                return d.length > 10 ? d.slice(-10) : d
            }
            const normalizedInput = isPhone ? normalize(identifier) : identifier

            return users.find(u => {
                if (u.id === identifier || u.email === identifier) return u.password === password
                const userPhone = normalize(u.phone || '')
                const userWhatsapp = normalize(u.whatsapp || '')
                if (isPhone && (userPhone === normalizedInput || userWhatsapp === normalizedInput)) {
                    return u.password === password
                }
                return false
            }) || null
        } catch (error) {
            console.error('Login storage error:', error)
            return null
        }
    },

    // Settings
    getSettings: async (): Promise<Record<string, any>> => {
        try {
            const res = await fetch('/api/settings')
            if (!res.ok) return {}
            return await res.json()
        } catch (error) {
            console.error('Error fetching settings:', error)
            return {}
        }
    },
    updateSetting: async (key: string, value: any) => {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
        })
        return res.ok
    },

    // Product Requests
    async getProductRequests(): Promise<ProductRequest[]> {
        const res = await fetch('/api/product-requests')
        return res.json()
    },

    async addProductRequest(request: ProductRequest): Promise<boolean> {
        const res = await fetch('/api/product-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })
        return res.ok
    },

    async updateProductRequest(request: ProductRequest): Promise<boolean> {
        const res = await fetch(`/api/product-requests?id=${request.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })
        return res.ok
    }
}
