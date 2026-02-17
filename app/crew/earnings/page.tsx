'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { useAuth } from '@/context/auth-context'
import { Booking } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, Calendar, CheckCircle2 } from 'lucide-react'

export default function CrewEarnings() {
    const { user } = useAuth()
    const [myEvents, setMyEvents] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadMyEvents = async () => {
            if (user) {
                const allBookings = await storage.getBookings()
                const assigned = allBookings.filter(b => b.crewAssigned?.includes(user.id))
                setMyEvents(assigned)
                setLoading(false)
            }
        }
        loadMyEvents()
    }, [user])

    const completedEvents = myEvents.filter(e => e.status === 'COMPLETED' || e.status === 'CONFIRMED')
    const totalEarnings = completedEvents.length * 1000 // Mock rate of 1000 per event

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">My Earnings</h2>
                <p className="text-muted-foreground">Track your income from completed events.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-dark border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Based on {completedEvents.length} events</p>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedEvents.length}</div>
                        <p className="text-xs text-muted-foreground">Total payout pending</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-dark border-white/10">
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Details of your earnings per event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {completedEvents.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">No completed events yet.</p>
                        ) : (
                            completedEvents.map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{event.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()} - {event.eventType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">₹1,000</p>
                                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                                            Status: {event.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
