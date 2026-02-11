'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Booking, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Users as UsersIcon,
    AlertCircle,
    Search,
    MessageSquare,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CustomerFinancialDetail {
    customerId: string
    customerName: string
    totalAmount: number
    totalAdvance: number
    totalReceived: number
    totalBalance: number
    bookingCount: number
    phone?: string
}

export default function FinanceLedgerPage() {
    const [ledger, setLedger] = useState<CustomerFinancialDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadLedger()
    }, [])

    const loadLedger = async () => {
        const [bookings, users] = await Promise.all([
            storage.getBookings(),
            storage.getUsers()
        ])

        const customers = users.filter(u => u.role === 'CUSTOMER')

        // Group findings by customer
        const customerMap = new Map<string, CustomerFinancialDetail>()

        // 1. Process known customers
        customers.forEach(c => {
            customerMap.set(c.id, {
                customerId: c.id,
                customerName: c.name,
                totalAmount: 0,
                totalAdvance: 0,
                totalReceived: 0,
                totalBalance: 0,
                bookingCount: 0,
                phone: c.phone
            })
        })

        // 2. Aggregate data from bookings
        bookings.forEach(b => {
            const id = b.customerId || b.customerName // Fallback to name if not linked to an account
            let detail = customerMap.get(id)

            if (!detail) {
                detail = {
                    customerId: id,
                    customerName: b.customerName,
                    totalAmount: 0,
                    totalAdvance: 0,
                    totalReceived: 0,
                    totalBalance: 0,
                    bookingCount: 0,
                    phone: b.customerPhone
                }
                customerMap.set(id, detail)
            }

            detail.totalAmount += b.amount || 0
            detail.totalAdvance += b.advanceAmount || 0
            detail.totalReceived += b.receivedAmount || 0
            detail.totalBalance += b.balanceAmount || 0
            detail.bookingCount++
        })

        setLedger(Array.from(customerMap.values()))
        setLoading(false)
    }

    const filteredLedger = ledger.filter(l =>
        l.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalStats = {
        receivable: ledger.reduce((acc, curr) => acc + curr.totalBalance, 0),
        collected: ledger.reduce((acc, curr) => acc + curr.totalReceived + curr.totalAdvance, 0),
        totalVal: ledger.reduce((acc, curr) => acc + curr.totalAmount, 0)
    }

    const sendWhatsAppRemainder = (customer: CustomerFinancialDetail) => {
        if (!customer.phone) {
            alert('Phone missing!')
            return
        }
        const msg = `Hello ${customer.customerName}, this is Vetri DJ Admin. \n\nThis is a friendly reminder regarding your outstanding balance of ₹${customer.totalBalance.toLocaleString()}. \n\nPlease let us know when you can process the payment. Thank you!`
        window.open(`https://wa.me/91${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    if (loading) return <div>Loading ledger...</div>

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Ledger</h2>
                    <p className="text-muted-foreground">Comprehensive overview of all customer accounts and receivables.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/10">Export PDF</Button>
                    <Button className="bg-primary text-background font-bold shadow-lg shadow-primary/20">
                        Record New Payment
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" /> Total Collected
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">₹{totalStats.collected.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Advance + Received payments to date</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-400" /> Total Receivables
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-orange-400">₹{totalStats.receivable.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Total outstanding balance from all clients</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-primary" /> Active Accounts
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">{ledger.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Registered and guest customer entities</p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search ledger by customer name..."
                    className="pl-10 bg-white/5 border-white/10 max-w-md h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden glass-dark shadow-xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold">Customer</TableHead>
                            <TableHead className="font-bold">Events</TableHead>
                            <TableHead className="font-bold">Total Val</TableHead>
                            <TableHead className="font-bold text-green-400">Paid (Adv+Rec)</TableHead>
                            <TableHead className="font-bold text-orange-400">Balance</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLedger.map((customer) => (
                            <TableRow key={customer.customerId} className="border-white/10 hover:bg-white/5 group transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                            {customer.customerName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{customer.customerName}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{customer.phone || 'No Phone'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-none">
                                        {customer.bookingCount} Bookings
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">₹{customer.totalAmount.toLocaleString()}</TableCell>
                                <TableCell className="text-green-400 font-bold">
                                    ₹{(customer.totalReceived + customer.totalAdvance).toLocaleString()}
                                </TableCell>
                                <TableCell className={`font-black ${customer.totalBalance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                    ₹{customer.totalBalance.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                                            onClick={() => sendWhatsAppRemainder(customer)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" /> Remind
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:bg-white/5 group-hover:text-primary">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
