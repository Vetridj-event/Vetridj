'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MusicalNotes } from '@/components/musical-notes'
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    UserCircle,
    Music,
    PhoneCall
} from 'lucide-react'
import { useState } from 'react'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'CUSTOMER')) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    }

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/customer/dashboard' },
        { name: 'My Bookings', icon: Calendar, href: '/customer/bookings' },
        { name: 'Contact Support', icon: PhoneCall, href: '/customer/support' },
        { name: 'Settings', icon: Settings, href: '/customer/settings' },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground bg-mesh">
            <MusicalNotes />

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-dark border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Music className="w-6 h-6 text-background" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Vetri Portal</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 h-11 px-4 transition-all ${pathname === item.href
                                            ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 px-2 mb-6">
                            <UserCircle className="w-10 h-10 text-muted-foreground" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                            onClick={logout}
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 w-full z-40 h-16 glass border-b border-white/10 px-6 flex items-center justify-between">
                <Music className="w-8 h-8 text-primary" />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </header>

            {/* Main Content */}
            <main className={`transition-all duration-300 pt-16 lg:pt-0 ${isMobileMenuOpen ? 'blur-sm lg:blur-none' : ''} lg:pl-64 min-h-screen`}>
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
