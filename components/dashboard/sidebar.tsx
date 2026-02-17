'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import {
    BarChart3,
    Calendar,
    Users,
    Settings,
    LogOut,
    Music,
    Box,
    CreditCard,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

interface SidebarItem {
    name: string
    href: string
    icon: any
    badge?: string | number
}

interface SidebarProps {
    items: SidebarItem[]
    title: string
    subtitle: string
}

export function Sidebar({ items, title, subtitle }: SidebarProps) {
    const pathname = usePathname()
    const { logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out border-r border-white/10 bg-background/95 backdrop-blur-xl",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                                <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Vetri DJ</h1>
                        </div>
                        <p className="text-xs text-primary font-medium pl-11">{subtitle}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {items.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.name}
                                    {item.badge && (
                                        <span className="ml-auto bg-primary text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}
