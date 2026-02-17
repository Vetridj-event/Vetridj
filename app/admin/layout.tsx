'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import {
    LayoutDashboard,
    CalendarDays,
    MonitorCheck,
    Users,
    CreditCard,
    Package,
    Book,
    UserCircle
} from 'lucide-react'

import { Notifications } from '@/components/notifications'
import { HelpCenter } from '@/components/help-center'
import { FeedbackMechanism } from '@/components/feedback-mechanism'

import { storage } from '@/lib/storage'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        const checkPending = async () => {
            const bookings = await storage.getBookings()
            setPendingCount(bookings.filter(b => b.status === 'PENDING').length)
        }
        checkPending()
        const interval = setInterval(checkPending, 30000)
        return () => clearInterval(interval)
    }, [])

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : undefined },
        { name: 'Website & Packages', href: '/admin/website', icon: MonitorCheck },
        { name: 'Inventory', href: '/admin/inventory', icon: Package },
        { name: 'Finance Ledger', href: '/admin/finance/ledger', icon: CreditCard },
        { name: 'Crew Management', href: '/admin/crew', icon: Users },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Workspace', href: '/admin/workspace', icon: Book },
        { name: 'Profile', href: '/admin/profile', icon: UserCircle },
    ]

    return (
        <div className="min-h-screen bg-background">
            <Notifications />
            <HelpCenter />
            <FeedbackMechanism />
            <Sidebar
                items={navItems}
                title="Vetri Admin"
                subtitle="ADMIN PORTAL"
            />
            <main className="md:ml-64 min-h-screen">
                <div className="container mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
