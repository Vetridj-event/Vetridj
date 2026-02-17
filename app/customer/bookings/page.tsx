'use client'

import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Booking, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    CreditCard,
    Clock,
    MapPin,
    Search,
    Filter,
    ArrowUpRight,
    MessageSquare,
    IndianRupee,
    CheckCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { generateInvoicePDF } from '@/lib/invoice-utils'

export default function MyBookingsPage() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [upiId, setUpiId] = useState('')
    const [selectedBookingForPay, setSelectedBookingForPay] = useState<Booking | null>(null)

    useEffect(() => {
        if (user) {
            Promise.all([
                storage.getBookings(),
                storage.getSettings()
            ]).then(([all, settings]) => {
                const myBookings = all.filter(b => b.customerId === user.id || b.customerEmail === user.email)
                setBookings(myBookings)
                if (settings.upi_id) setUpiId(settings.upi_id)

                // Auto-open payment popup if requested and confirmed
                const requested = myBookings.find(b => b.status === 'CONFIRMED' && b.paymentRequested && (b.balanceAmount || 0) > 0)
                if (requested) {
                    setSelectedBookingForPay(requested)
                    toast.info('Payment Requested', {
                        description: `Admin has requested a balance payment for your ${requested.eventType} event.`
                    })
                }

                setLoading(false)
            })
        }
    }, [user])

    const filteredBookings = bookings.filter(b =>
        b.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.djPackage?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading your events...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Bookings</h1>
                    <p className="text-muted-foreground">Detailed history and status of all your events with Vetri DJ.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find an event..."
                            className="pl-10 bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-white/10 shrink-0">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {filteredBookings.length === 0 ? (
                    <div className="p-20 text-center glass-dark rounded-3xl border border-dashed border-white/10">
                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
                        <h3 className="text-xl font-bold mb-1">No bookings found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">It looks like you haven't booked any events yet. Contact us to make your first booking!</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card key={booking.id} className="glass-dark border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-500">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 lg:grid-cols-4">
                                    {/* Event Details Section */}
                                    <div className="lg:col-span-2 p-8 border-b lg:border-b-0 lg:border-r border-white/5 relative">
                                        <div className="absolute top-8 right-8 lg:hidden">
                                            <Badge className={
                                                booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                                    booking.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 'bg-white/5'
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px] tracking-widest font-black border-none">
                                                    {booking.eventType}
                                                </Badge>
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                                                {booking.djPackage || 'Wedding Special Mix'}
                                            </h2>
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    <Calendar className="w-4 h-4 text-primary" /> {new Date(booking.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </span>
                                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    <MapPin className="w-4 h-4 text-primary" /> {booking.location || 'Coimbatore, TN'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                                                <p className="text-sm italic text-balance">"{booking.notes || 'Looking forward to an amazing musical experience!'}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions Section */}
                                    <div className="p-8 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col justify-center items-center">
                                        <div className="space-y-4 text-center">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Stage</p>
                                            <div className="flex flex-col items-center gap-4">
                                                <div className={`p-6 rounded-3xl ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                                                    }`}>
                                                    {booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? <CheckCircle className="w-12 h-12" /> : <Clock className="w-12 h-12" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-2xl">{booking.status}</p>
                                                    {booking.status === 'CONFIRMED' ? (
                                                        <>
                                                            {booking.paymentRequested && (booking.balanceAmount || 0) > 0 ? (
                                                                <p className="text-sm text-primary font-bold animate-pulse">Payment Requested</p>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground italic">Booking Confirmed</p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic">Waiting for admin confirmation</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-8 lg:mt-0">
                                        <p className="text-xs font-black text-muted-foreground lg:hidden uppercase tracking-widest mb-2">Support</p>
                                        <Button variant="outline" className="w-full h-11 border-white/10 font-bold hover:bg-white/5">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Message Admin
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-11 text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs"
                                            onClick={() => user && generateInvoicePDF(booking, user)}
                                        >
                                            Download Invoice (PDF)
                                        </Button>
                                        {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Amount</span>
                                                    <span className="font-bold">₹{booking.amount?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-primary">
                                                    <span className="text-[10px] font-bold uppercase">Balance Due</span>
                                                    <span className="font-black">₹{booking.balanceAmount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {booking.status === 'CONFIRMED' && booking.paymentRequested && (booking.balanceAmount || 0) > 0 && (
                                            <Button
                                                className="w-full bg-primary text-background font-bold h-11"
                                                onClick={() => setSelectedBookingForPay(booking)}
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" /> Pay Balance
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* UPI Payment Drawer/Dialog */}
            <Dialog open={!!selectedBookingForPay} onOpenChange={(open) => !open && setSelectedBookingForPay(null)}>
                <DialogContent className="glass-dark border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                        <DialogDescription>
                            Select your preferred UPI app to pay the balance of ₹{selectedBookingForPay?.balanceAmount?.toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-6">
                        {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                            <Button
                                key={app}
                                variant="outline"
                                className="h-16 justify-between border-white/10 hover:bg-primary/10 hover:border-primary/50 group"
                                onClick={() => {
                                    if (!upiId) return toast.error('UPI configuration missing')
                                    const name = encodeURIComponent('VETRI DJ EVENTS')
                                    const amount = selectedBookingForPay?.balanceAmount
                                    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`
                                    window.open(upiUrl, '_blank')
                                }}
                            >
                                <span className="font-bold">{app}</span>
                                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
