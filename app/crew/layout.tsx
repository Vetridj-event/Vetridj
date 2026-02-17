'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import {
    LayoutDashboard,
    CalendarDays,
    Package,
    IndianRupee,
    Settings
} from 'lucide-react'

export default function CrewLayout({ children }: { children: React.ReactNode }) {
    const navItems = [
        { name: 'My Dashboard', href: '/crew/dashboard', icon: LayoutDashboard },
        { name: 'Calendar', href: '/crew/calendar', icon: CalendarDays },
        { name: 'Inventory View', href: '/crew/inventory', icon: Package },
        { name: 'My Earnings', href: '/crew/earnings', icon: IndianRupee },
        { name: 'Settings', href: '/crew/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                items={navItems}
                title="Vetri Crew"
                subtitle="CREW PORTAL"
            />
            <main className="md:ml-64 min-h-screen">
                <div className="container mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
