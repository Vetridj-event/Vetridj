'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Booking, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Filter, Trash, Edit, MessageSquare, IndianRupee, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { BookingReportModal } from '@/components/booking-report-modal'
import { FinanceRecord } from '@/types'
import { LayoutGrid, List, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [crewMembers, setCrewMembers] = useState<User[]>([])
    const [customers, setCustomers] = useState<User[]>([])
    const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
    const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('CARDS')
    const [selectedBookingForReport, setSelectedBookingForReport] = useState<Booking | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<Booking>>({
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [bks, usr, fin] = await Promise.all([
            storage.getBookings(),
            storage.getUsers(),
            storage.getFinanceRecords()
        ])
        setBookings(bks)
        setCrewMembers(usr.filter(u => u.role === 'CREW'))
        setCustomers(usr.filter(u => u.role === 'CUSTOMER'))
        setFinanceRecords(fin)
    }

    const calculateBalance = (total: number, advance: number, received: number) => {
        return total - (advance + received)
    }

    const handleSave = async () => {
        const totalAmount = Number(formData.amount) || 0
        const advance = Number(formData.advanceAmount) || 0
        const received = Number(formData.receivedAmount) || 0
        const balance = calculateBalance(totalAmount, advance, received)

        const bookingData = {
            ...formData,
            amount: totalAmount,
            advanceAmount: advance,
            receivedAmount: received,
            balanceAmount: balance
        } as Booking

        if (editingBooking) {
            await storage.updateBooking({ ...editingBooking, ...bookingData })
        } else {
            const newBooking: Booking = {
                ...bookingData,
                id: `bk-${Date.now()}`
            }
            await storage.addBooking(newBooking)
        }
        await loadData()
        setIsDialogOpen(false)
        setEditingBooking(null)
        setFormData({ status: 'PENDING', date: new Date().toISOString().split('T')[0] })
    }

    const sendWhatsApp = (booking: Booking, type: 'REQUEST' | 'RECEIPT') => {
        const phone = booking.customerPhone?.replace(/\D/g, '')
        if (!phone) {
            alert('Phone number missing!')
            return
        }

        const message = type === 'REQUEST'
            ? `Hello ${booking.customerName}, this is Vetri DJ. We are requesting a payment for your ${booking.eventType} on ${new Date(booking.date).toLocaleDateString()}. \n\nTotal: ₹${booking.amount}\nBalance Due: ₹${booking.balanceAmount}\n\nPlease pay to confirm your slot. Thank you!`
            : `Hello ${booking.customerName}, we have received your payment of ₹${booking.receivedAmount} for the ${booking.eventType} on ${new Date(booking.date).toLocaleDateString()}. \n\nRemaining Balance: ₹${booking.balanceAmount}. \n\nThank you for choosing Vetri DJ!`

        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }

    const togglePaymentRequest = async (booking: Booking) => {
        const updated = { ...booking, paymentRequested: !booking.paymentRequested }
        await storage.updateBooking(updated)
        await loadData()
    }

    const markAsPaid = async (booking: Booking) => {
        if (!confirm(`Mark full balance for ${booking.customerName} as paid?`)) return

        const balance = booking.balanceAmount || 0
        const updated = {
            ...booking,
            receivedAmount: (booking.receivedAmount || 0) + balance,
            balanceAmount: 0,
            status: 'CONFIRMED' as const
        }
        await storage.updateBooking(updated)

        // Also add a finance record
        await storage.addFinanceRecord({
            id: `fin-${Date.now()}`,
            type: 'INCOME',
            amount: balance,
            category: 'Booking Payment',
            date: new Date().toISOString(),
            description: `Final payment for ${booking.customerName} (${booking.eventType})`,
            relatedBookingId: booking.id
        })
        await loadData()
        toast.success('Payment marked as received!')
    }

    const openEdit = (booking: Booking) => {
        setEditingBooking(booking)
        setFormData(booking)
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            storage.deleteBooking(id).then(() => loadData())
        }
    }

    const filteredBookings = bookings.filter(b =>
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    return (
        <div className="space-y-8" >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
                    <p className="text-muted-foreground">Manage event bookings and crew assignments.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingBooking(null); setFormData({}) }} className="bg-primary hover:bg-primary/90 text-background">
                            <Plus className="mr-2 h-4 w-4" /> New Booking
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingBooking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Customer</Label>
                                <Input
                                    id="name"
                                    value={formData.customerName || ''}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.customerPhone || ''}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user" className="text-right">Link User</Label>
                                <Select
                                    value={formData.customerId || ''}
                                    onValueChange={(val) => setFormData({ ...formData, customerId: val })}
                                >
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Link to Customer Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Guest)</SelectItem>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="event" className="text-right">Event Type</Label>
                                <Input
                                    id="event"
                                    value={formData.eventType || ''}
                                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "col-span-3 justify-start text-left font-normal bg-white/5 border-white/10",
                                                !formData.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.date ? new Date(formData.date) : undefined}
                                            onSelect={(date) => date && setFormData({ ...formData, date: date.toISOString().split('T')[0] })}
                                            initialFocus
                                            modifiers={{
                                                booked: bookings.map(b => new Date(b.date))
                                            }}
                                            modifiersStyles={{
                                                booked: { textDecoration: 'underline', color: 'var(--primary)', fontWeight: 'bold' }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">Total Fee</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="advance" className="text-right">Advance</Label>
                                <Input
                                    id="advance"
                                    type="number"
                                    value={formData.advanceAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="received" className="text-right">Received</Label>
                                <Input
                                    id="received"
                                    type="number"
                                    value={formData.receivedAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, receivedAmount: Number(e.target.value) })}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Balance</Label>
                                <div className="col-span-3 px-3 py-2 bg-primary/10 rounded-lg text-primary font-bold">
                                    ₹{calculateBalance(Number(formData.amount || 0), Number(formData.advanceAmount || 0), Number(formData.receivedAmount || 0)).toLocaleString()}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="crew" className="text-right">Crew</Label>
                                <Select
                                    value={formData.crewAssigned?.[0] || ''}
                                    onValueChange={(val) => setFormData({ ...formData, crewAssigned: [val] })}
                                >
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Assign Crew" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {crewMembers.map(crew => (
                                            <SelectItem key={crew.id} value={crew.id}>{crew.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} className="bg-primary text-background">Save Details</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-10 bg-white/5 border-white/10 w-full md:max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'TABLE' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setViewMode('TABLE')}
                        >
                            <List className="h-4 w-4 mr-2" /> Table
                        </Button>
                        <Button
                            variant={viewMode === 'CARDS' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setViewMode('CARDS')}
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" /> Cards
                        </Button>
                    </div>
                    <Button variant="outline" className="border-white/10 bg-white/5">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
            </div>

            {viewMode === 'TABLE' ? (
                <div className="rounded-lg border border-white/10 overflow-hidden glass-dark">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead>Customer</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedBookingForReport(booking)}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{booking.customerName}</span>
                                                <span className="text-[10px] text-muted-foreground">{booking.customerPhone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {booking.eventType}
                                                {booking.customerId && <UserIcon className="w-3 h-3 text-primary" />}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{booking.amount.toLocaleString()}</TableCell>
                                        <TableCell className={`font-bold ${(booking.balanceAmount || 0) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                            ₹{(booking.balanceAmount || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => sendWhatsApp(booking, 'REQUEST')}
                                                    className="hover:text-primary hover:bg-primary/10"
                                                    title="Send WhatsApp Message"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </Button>
                                                {(booking.balanceAmount || 0) > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => togglePaymentRequest(booking)}
                                                        className={cn(
                                                            "hover:text-primary hover:bg-primary/10",
                                                            booking.paymentRequested && "text-primary bg-primary/10"
                                                        )}
                                                        title={booking.paymentRequested ? "Payment Already Requested" : "Request Payment"}
                                                    >
                                                        <IndianRupee className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {(booking.balanceAmount || 0) > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsPaid(booking)}
                                                        className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(booking)}
                                                    className="hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => (
                        <Card
                            key={booking.id}
                            className="glass-dark border-white/5 hover:border-primary/30 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                            onClick={() => setSelectedBookingForReport(booking)}
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="outline" className={getStatusColor(booking.status)}>
                                    {booking.status}
                                </Badge>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-white font-bold">{booking.customerName}</CardTitle>
                                        <CardDescription className="text-[10px] uppercase tracking-widest">{booking.customerPhone}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                    <span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(booking.date).toLocaleDateString()}</span>
                                    <span className="font-bold text-primary">{booking.eventType}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Fee</p>
                                        <p className="font-bold text-white">₹{booking.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Balance</p>
                                        <p className={`font-black ${(booking.balanceAmount || 0) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                            ₹{(booking.balanceAmount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "flex-1 bg-white/5 border border-white/5 text-[10px] font-bold uppercase transition-all hover:bg-primary hover:text-background",
                                            booking.paymentRequested && "bg-primary/20 text-primary border-primary/30"
                                        )}
                                        onClick={() => togglePaymentRequest(booking)}
                                    >
                                        {booking.paymentRequested ? 'Requested' : 'Req Pay'}
                                    </Button>
                                    {(booking.balanceAmount || 0) > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase text-green-400 hover:bg-green-500 hover:text-white"
                                            onClick={() => markAsPaid(booking)}
                                        >Paid</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredBookings.length === 0 && (
                        <div className="col-span-3 py-20 text-center glass-dark border border-dashed border-white/10 rounded-3xl">
                            <p className="text-muted-foreground">No bookings matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {
                selectedBookingForReport && (
                    <BookingReportModal
                        isOpen={!!selectedBookingForReport}
                        onOpenChange={(open: boolean) => !open && setSelectedBookingForReport(null)}
                        booking={selectedBookingForReport}
                        crewMembers={crewMembers}
                        financeRecords={financeRecords}
                    />
                )
            }
        </div >
    )
}
