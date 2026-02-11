'use client'

import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Booking } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    Music,
    ArrowRight,
    Sparkles,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CustomerDashboard() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            storage.getBookings().then(all => {
                const myBookings = all.filter(b => b.customerId === user.id || b.customerEmail === user.email)
                setBookings(myBookings)
                setLoading(false)
            })
        }
    }, [user])

    const stats = [
        {
            label: 'Total Bookings',
            value: bookings.length,
            icon: Music,
            color: 'text-primary bg-primary/10'
        },
        {
            label: 'Upcoming Events',
            value: bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length,
            icon: Calendar,
            color: 'text-blue-400 bg-blue-500/10'
        },
        {
            label: 'Payments Completed',
            value: bookings.filter(b => (b.balanceAmount || 0) <= 0 && b.amount > 0).length,
            icon: CheckCircle,
            color: 'text-green-400 bg-green-500/10'
        },
        {
            label: 'Outstanding Balance',
            value: `₹${bookings.reduce((acc, b) => acc + (b.balanceAmount || 0), 0).toLocaleString()}`,
            icon: CreditCard,
            color: 'text-orange-400 bg-orange-500/10'
        },
    ]

    if (loading) return <div>Loading dashboard...</div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                    Welcome back, {user?.name.split(' ')[0]}! <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </h1>
                <p className="text-muted-foreground text-lg">Manage your event bookings and track your payment details.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="glass-dark border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold tracking-tight px-1">Active Bookings</h2>
                        <Link href="/customer/bookings">
                            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 font-bold group">
                                View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <Card className="glass-dark border-dashed border-white/10 p-12 text-center">
                            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No bookings found. Contact our admin to get started!</p>
                            <Button className="mt-6 font-bold" variant="outline">Schedule a Consultation</Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {bookings.slice(0, 3).map((booking) => (
                                <Card key={booking.id} className="glass-dark border-white/5 hover:bg-white/5 transition-all overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                        {booking.eventType}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {new Date(booking.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{booking.djPackage || 'Standard Mix Package'}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Event starts at 7:00 PM
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                                                booking.status === 'PENDING' ? 'bg-orange-500' : 'bg-gray-500'
                                                            }`}></div>
                                                        <span className="font-bold">{booking.status}</span>
                                                    </div>
                                                </div>
                                                <Link href={`/customer/bookings?id=${booking.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-white/10 hover:border-primary/50">Details</Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {/* Progress bar visual for payment */}
                                        <div className="w-full h-1 bg-white/5">
                                            <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${Math.min(100, ((booking.amount - (booking.balanceAmount || 0)) / booking.amount) * 100)}%` }}></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Content: Payment Notice */}
                <div className="space-y-6">
                    <Card className="glass-dark border-primary/20 bg-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-125 transition-transform duration-500">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <CreditCard className="w-5 h-5" /> Payment Notice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-balance">Ensure your **Advance** is paid to confirm your slot for the wedding season!</p>
                            <div className="p-4 bg-background/50 rounded-xl border border-white/5 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Next Payment Due</span>
                                    <span className="font-bold">Immediate</span>
                                </div>
                                <div className="text-xl font-bold">₹{bookings.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + (b.advanceAmount || (b.amount * 0.2)), 0).toLocaleString()}</div>
                            </div>
                            <Button className="w-full bg-primary text-background font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                Pay via UPI
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-dark border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-400" /> Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">Having trouble with your booking or technical issues? Our support is available 24/7.</p>
                            <Button variant="outline" className="w-full text-xs font-bold border-white/10 hover:bg-white/5">
                                Open Support Ticket
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
