'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { useAuth } from '@/context/auth-context'
import { Booking } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'

export default function CrewDashboard() {
    const { user } = useAuth()
    const [myEvents, setMyEvents] = useState<Booking[]>([])

    useEffect(() => {
        const loadMyEvents = async () => {
            if (user) {
                const allBookings = await storage.getBookings()
                // Filter bookings where this crew member is assigned
                const assigned = allBookings.filter(b => b.crewAssigned?.includes(user.id))
                setMyEvents(assigned)
            }
        }
        loadMyEvents()
    }, [user])

    const upcomingEvents = myEvents.filter(e => new Date(e.date) >= new Date())

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h2>
                <p className="text-muted-foreground">Here are your upcoming event assignments.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="glass-dark border-white/10 flex flex-col items-center justify-center min-h-[300px]">
                    <CardHeader className="w-full">
                        <CardTitle className="text-center">My Schedule</CardTitle>
                        <CardDescription className="text-center">Assigned Dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-md border border-white/10"
                            modifiers={{
                                assigned: myEvents.map(b => new Date(b.date))
                            }}
                            modifiersStyles={{
                                assigned: {
                                    fontWeight: 'bold',
                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                    color: '#22c55e',
                                    borderRadius: '100%'
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {upcomingEvents.length === 0 ? (
                    <div className="col-span-1 lg:col-span-2 text-center py-12 text-muted-foreground bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                        No upcoming events assigned. Check with Admin.
                    </div>
                ) : (
                    upcomingEvents.map((event) => (
                        <Card key={event.id} className="glass-dark border-white/10 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                        {event.eventType}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">{event.status}</Badge>
                                </div>
                                <CardTitle className="text-xl">{event.customerName}</CardTitle>
                                <CardDescription>
                                    Reference ID: {event.id}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{event.location || 'Location Pending'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>Arrival Time: 4:00 PM</span>
                                </div>
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                        <p className="text-[10px] uppercase font-bold text-primary mb-1 tracking-wider">Event Instructions</p>
                                        <p className="text-sm text-white/80 italic">"{event.notes || 'Ensure all sound checks are done 30 mins before start.'}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs border-white/10 hover:bg-primary hover:text-background transition-all"
                                            asChild
                                        >
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                Get Location
                                            </a>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className={`${event.checkInTime?.[user?.id || ''] ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} text-background font-bold text-xs flex-1`}
                                            onClick={async () => {
                                                if (user) {
                                                    const now = new Date().toLocaleTimeString()
                                                    const updated = { ...event, checkInTime: { ...event.checkInTime, [user.id]: now } } as Booking
                                                    await storage.updateBooking(updated)
                                                    // Refresh events
                                                    const allBookings = await storage.getBookings()
                                                    setMyEvents(allBookings.filter(b => b.crewAssigned?.includes(user.id)))
                                                }
                                            }}
                                            disabled={!!event.checkInTime?.[user?.id || '']}
                                        >
                                            {event.checkInTime?.[user?.id || ''] ? `Arrived at ${event.checkInTime?.[user?.id || '']}` : 'Arrive at Event'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
