'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Booking, User, FinanceRecord } from '@/types'
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
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Search,
    MessageSquare,
    ArrowUpRight,
    Edit,
    Trash,
    Plus,
    Calendar,
    Filter,
    Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

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
    const [bookings, setBookings] = useState<Booking[]>([])
    const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // CRUD States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null)
    const [formData, setFormData] = useState<Partial<FinanceRecord>>({
        type: 'EXPENSE',
        amount: 0,
        category: 'Event Expense',
        description: '',
        relatedBookingId: 'none',
        date: new Date().toISOString().split('T')[0]
    })

    const [totalStats, setTotalStats] = useState({
        receivable: 0,
        collected: 0,
        eventExpenses: 0,
        operationalExpenses: 0,
        netCashFlow: 0
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [allBookings, users, finance] = await Promise.all([
                storage.getBookings(),
                storage.getUsers(),
                storage.getFinanceRecords()
            ])

            setBookings(allBookings)
            setFinanceRecords(finance)

            const customers = users.filter(u => u.role === 'CUSTOMER')
            const customerMap = new Map<string, CustomerFinancialDetail>()

            // Aggregate data from bookings
            allBookings.forEach(b => {
                const id = b.customerId || b.customerName
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

            const income = finance.filter(f => f.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0)
            const eventExp = finance.filter(f => f.type === 'EXPENSE' && f.relatedBookingId && f.relatedBookingId !== 'none').reduce((acc, curr) => acc + curr.amount, 0)
            const operExp = finance.filter(f => f.type === 'EXPENSE' && (!f.relatedBookingId || f.relatedBookingId === 'none')).reduce((acc, curr) => acc + curr.amount, 0)

            const ledgerData = Array.from(customerMap.values())

            setTotalStats({
                receivable: ledgerData.reduce((acc, curr) => acc + curr.totalBalance, 0),
                collected: income,
                eventExpenses: eventExp,
                operationalExpenses: operExp,
                netCashFlow: income - eventExp - operExp
            })

            setLedger(ledgerData)
        } catch (error) {
            console.error('Failed to load ledger:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.amount || !formData.description) return toast.error('Enter amount and description')

        try {
            const recordData = {
                ...formData,
                relatedBookingId: formData.relatedBookingId === 'none' ? undefined : formData.relatedBookingId
            } as FinanceRecord

            if (editingRecord) {
                await storage.updateFinanceRecord({ ...editingRecord, ...recordData })
                toast.success('Record updated')
            } else {
                await storage.addFinanceRecord({
                    ...recordData,
                    id: `fin-${Date.now()}`
                })
                toast.success('Record added')
            }
            setIsModalOpen(false)
            loadData()
        } catch (error) {
            toast.error('Failed to save record')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return
        try {
            await storage.deleteFinanceRecord(id)
            toast.success('Record deleted')
            loadData()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const openEdit = (record: FinanceRecord) => {
        setEditingRecord(record)
        setFormData({
            ...record,
            relatedBookingId: record.relatedBookingId || 'none',
            date: record.date.split('T')[0]
        })
        setIsModalOpen(true)
    }

    const sendWhatsAppRemainder = (customer: CustomerFinancialDetail) => {
        if (!customer.phone) return alert('Phone missing!')
        const msg = `Hello ${customer.customerName}, outstanding balance of ₹${customer.totalBalance.toLocaleString()}. Please process. Thank you!`
        window.open(`https://wa.me/91${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    if (loading && ledger.length === 0) return <div className="p-20 text-center animate-pulse">Loading financial data...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Finance & Ledger</h2>
                    <p className="text-muted-foreground">Comprehensive tracking of income, expenses, and receivables.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditingRecord(null); setFormData({ type: 'EXPENSE', category: 'Event Expense', amount: 0, relatedBookingId: 'none', date: new Date().toISOString().split('T')[0] }) }} className="bg-primary text-background font-bold">
                                <Plus className="mr-2 h-4 w-4" /> Record Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingRecord ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INCOME">Income</SelectItem>
                                                <SelectItem value="EXPENSE">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Event Income">Event Income</SelectItem>
                                            <SelectItem value="Event Expense">Event Expense</SelectItem>
                                            <SelectItem value="Salary">Salary</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Travel/Fuel">Travel/Fuel</SelectItem>
                                            <SelectItem value="Vendor Payout">Vendor Payout</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Related Booking (Optional)</Label>
                                    <Select value={formData.relatedBookingId} onValueChange={(v) => setFormData({ ...formData, relatedBookingId: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-xs">
                                            <SelectValue placeholder="Select Event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">General / No Booking</SelectItem>
                                            {bookings.map(b => (
                                                <SelectItem key={b.id} value={b.id} className="text-xs">
                                                    {b.customerName} - {b.eventType} ({new Date(b.date).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            className="bg-white/5 border-white/10 font-bold text-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Detail..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} className="w-full bg-primary text-background font-black uppercase">
                                    {editingRecord ? 'Update Entry' : 'Post Transaction'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-dark border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest"><TrendingUp className="w-3 h-3 text-green-400" /> Total Collected</CardDescription>
                        <CardTitle className="text-3xl font-black">₹{totalStats.collected.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="glass-dark border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest"><TrendingDown className="w-3 h-3 text-red-400" /> Total Expenses</CardDescription>
                        <CardTitle className="text-3xl font-black text-red-500">₹{(totalStats.eventExpenses + totalStats.operationalExpenses).toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="glass-dark border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest"><AlertCircle className="w-3 h-3 text-orange-400" /> Outstanding</CardDescription>
                        <CardTitle className="text-3xl font-black text-orange-400">₹{totalStats.receivable.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="glass-dark border-white/5 relative border-primary/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary">Net Profit/Loss</CardDescription>
                        <CardTitle className={`text-3xl font-black ${totalStats.netCashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
                            ₹{totalStats.netCashFlow.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Tabs defaultValue="ledger" className="w-full">
                <TabsList className="bg-white/5 border-white/10 mb-6">
                    <TabsTrigger value="ledger" className="px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-background">Customer Ledger</TabsTrigger>
                    <TabsTrigger value="records" className="px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-background">Transaction History</TabsTrigger>
                    <TabsTrigger value="event-pl" className="px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-background">Event P&L</TabsTrigger>
                </TabsList>

                <TabsContent value="ledger">
                    <div className="rounded-2xl border border-white/10 overflow-hidden glass-dark shadow-2xl">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10">
                                    <TableHead className="font-bold">Customer</TableHead>
                                    <TableHead className="font-bold">Events</TableHead>
                                    <TableHead className="font-bold">Total Bill</TableHead>
                                    <TableHead className="font-bold text-green-400">Received</TableHead>
                                    <TableHead className="font-bold text-orange-400">Balance</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Reminder</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledger.map((customer) => (
                                    <TableRow key={customer.customerId} className="border-white/10 hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black ring-1 ring-white/10">{customer.customerName.charAt(0)}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{customer.customerName}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{customer.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge className="bg-white/5 text-muted-foreground border-none px-2 py-0 h-5">{customer.bookingCount} Events</Badge></TableCell>
                                        <TableCell className="font-medium text-sm">₹{customer.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-400 font-bold text-sm">₹{(customer.totalReceived + customer.totalAdvance).toLocaleString()}</TableCell>
                                        <TableCell className={`font-black text-sm ${customer.totalBalance > 0 ? 'text-orange-400' : 'text-green-400'}`}>₹{customer.totalBalance.toLocaleString()}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost" size="sm"
                                                onClick={() => sendWhatsAppRemainder(customer)}
                                                className="text-green-400 hover:text-green-500 hover:bg-green-500/10 h-8 px-4 font-bold text-xs rounded-full"
                                            >
                                                Send Recall
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="records">
                    <div className="rounded-2xl border border-white/10 overflow-hidden glass-dark shadow-2xl">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10">
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Category</TableHead>
                                    <TableHead className="font-bold">Description</TableHead>
                                    <TableHead className="font-bold">Amount</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...financeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                                    <TableRow key={record.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                        <TableCell className="text-sm">{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={record.type === 'INCOME' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}>
                                                {record.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">{record.description}</TableCell>
                                        <TableCell className={`font-black ${record.type === 'INCOME' ? 'text-green-400' : 'text-white'}`}>
                                            {record.type === 'INCOME' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(record)}><Edit className="w-3.5 h-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(record.id)}><Trash className="w-3.5 h-3.5" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="event-pl">
                    <div className="grid gap-6">
                        <Card className="glass-dark border-white/10">
                            <CardHeader>
                                <CardTitle className="text-xl">Event Profitability Calculator</CardTitle>
                                <CardDescription>Select an event to see detailed P&L breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {bookings.slice(0, 6).map(booking => {
                                            const bookingExpenses = financeRecords
                                                .filter(f => f.relatedBookingId === booking.id && f.type === 'EXPENSE')
                                                .reduce((acc, curr) => acc + curr.amount, 0)
                                            const netProfit = (booking.amount || 0) - bookingExpenses

                                            return (
                                                <div key={booking.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all group">
                                                    <p className="font-bold text-white mb-1">{booking.customerName}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">{booking.eventType} • {new Date(booking.date).toLocaleDateString()}</p>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground">Revenue</span>
                                                            <span className="font-bold">₹{booking.amount?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground">Expenses</span>
                                                            <span className="text-red-400">₹{bookingExpenses.toLocaleString()}</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase text-primary">Est. Profit</span>
                                                            <span className={`font-black ${netProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>₹{netProfit.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
