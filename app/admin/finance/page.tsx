import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { FinanceRecord, User, Booking } from '@/types'
import { exportToCSV } from '@/lib/export-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet, Edit, Trash, Calculator, Calendar } from 'lucide-react'

export default function FinancePage() {
    const [records, setRecords] = useState<FinanceRecord[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [crew, setCrew] = useState<User[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCalcOpen, setIsCalcOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<string>('')
    const [calcData, setCalcData] = useState({
        description: '',
        amount: 0,
        category: 'Event Expense'
    })

    const [formData, setFormData] = useState<Partial<FinanceRecord>>({
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0]
    })
    const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [recs, users, bks] = await Promise.all([
            storage.getFinanceRecords(),
            storage.getUsers(),
            storage.getBookings()
        ])
        setRecords(recs)
        setCrew(users.filter(u => u.role === 'CREW'))
        setBookings(bks)
    }

    const handleSave = async () => {
        if (editingRecord) {
            await storage.updateFinanceRecord({ ...editingRecord, ...formData } as FinanceRecord)
        } else {
            const newRecord: FinanceRecord = {
                ...formData as FinanceRecord,
                id: `fin-${Date.now()}`,
                amount: Number(formData.amount) || 0
            }
            await storage.addFinanceRecord(newRecord)
        }
        await loadData()
        setIsDialogOpen(false)
        setEditingRecord(null)
        setFormData({ type: 'INCOME', date: new Date().toISOString().split('T')[0] })
    }

    const handleAddCalculatorExpense = async () => {
        if (!selectedBooking || !calcData.amount) return

        const booking = bookings.find(b => b.id === selectedBooking)
        const newRecord: FinanceRecord = {
            id: `fin-${Date.now()}`,
            type: 'EXPENSE',
            amount: Number(calcData.amount),
            category: calcData.category,
            description: `[Event: ${booking?.customerName} - ${booking?.eventType}] ${calcData.description}`,
            date: new Date().toISOString().split('T')[0],
            relatedBookingId: selectedBooking
        }

        await storage.addFinanceRecord(newRecord)
        await loadData()
        setCalcData({ description: '', amount: 0, category: 'Event Expense' })
        setIsCalcOpen(false)
    }

    const openEdit = (record: FinanceRecord) => {
        setEditingRecord(record)
        setFormData(record)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            await storage.deleteFinanceRecord(id)
            await loadData()
        }
    }

    const income = records.filter(r => r.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0)
    const expense = records.filter(r => r.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0)
    const balance = income - expense

    // Event Wise Profit/Loss
    const eventStats = bookings.map(b => {
        const eventIncome = records
            .filter(r => r.relatedBookingId === b.id && r.type === 'INCOME')
            .reduce((acc, curr) => acc + curr.amount, 0) || b.amount // Fallback to booking amount if no specific record

        const eventExpense = records
            .filter(r => r.relatedBookingId === b.id && r.type === 'EXPENSE')
            .reduce((acc, curr) => acc + curr.amount, 0)

        return {
            ...b,
            totalIncome: eventIncome,
            totalExpense: eventExpense,
            profit: eventIncome - eventExpense
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance & HR</h2>
                    <p className="text-muted-foreground">Track income, expenses, and crew payments.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                                <Calculator className="mr-2 h-4 w-4" /> Expense Calculator
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Event Expense</DialogTitle>
                                <DialogDescription>Calculate and log expenses for specific events.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Event</Label>
                                    <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                                        <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bookings.map(b => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.customerName} - {b.eventType} ({new Date(b.date).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Category</Label>
                                    <Input
                                        value={calcData.category}
                                        onChange={(e) => setCalcData({ ...calcData, category: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Description</Label>
                                    <Input
                                        value={calcData.description}
                                        onChange={(e) => setCalcData({ ...calcData, description: e.target.value })}
                                        placeholder="e.g. Travel, Extra Equipment"
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Amount</Label>
                                    <Input
                                        type="number"
                                        value={calcData.amount || ''}
                                        onChange={(e) => setCalcData({ ...calcData, amount: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddCalculatorExpense} className="bg-primary text-background">Add to Finance</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-background">
                                <Plus className="mr-2 h-4 w-4" /> Add Record
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingRecord ? 'Edit Record' : 'New Financial Record'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Income</SelectItem>
                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="desc" className="text-right">Description</Label>
                                    <Input
                                        id="desc"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. Salary, Repair, Advance"
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date || ''}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} className="bg-primary text-background">Save Record</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-dark border-white/5 text-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">₹{income.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">₹{expense.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">₹{balance.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-dark border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" /> Event-wise Profit Analysis
                    </CardTitle>
                    <CardDescription>Detailed breakdown of income and expenses per booking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead>Event / Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Package Price</TableHead>
                                <TableHead className="text-right">Total Expenses</TableHead>
                                <TableHead className="text-right">Net Profit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventStats.map((event) => (
                                <TableRow key={event.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell>
                                        <div className="font-medium text-sm">{event.eventType}</div>
                                        <div className="text-xs text-muted-foreground">{event.customerName}</div>
                                    </TableCell>
                                    <TableCell className="text-xs">{new Date(event.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right text-green-400 font-mono">₹{event.totalIncome.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-red-400 font-mono">₹{event.totalExpense.toLocaleString()}</TableCell>
                                    <TableCell className={`text-right font-bold font-mono ${event.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                        ₹{event.profit.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-dark border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Income and expense history.</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10"
                            onClick={() => exportToCSV(records, `finance_report_${new Date().toISOString().split('T')[0]}`)}
                        >
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.slice().reverse().map((record) => (
                                    <TableRow key={record.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="text-xs">{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{record.description}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{record.category}</p>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${record.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                                            {record.type === 'INCOME' ? '+' : '-'}₹{record.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(record)}
                                                    className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(record.id)}
                                                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5">
                    <CardHeader>
                        <CardTitle>Crew Payroll</CardTitle>
                        <CardDescription>Manage and track payments to your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {crew.map((member) => {
                                const pendingPayment = records.filter(r => r.category === 'Salary' && r.description.includes(member.name)).reduce((acc, curr) => acc + curr.amount, 0)
                                return (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">Paid to date: ₹{pendingPayment.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 border-primary/20 text-primary hover:bg-primary hover:text-background text-xs">Pay Crew</Button>
                                    </div>
                                )
                            })}
                            <Button variant="outline" className="w-full border-dashed border-white/10 hover:border-primary/50 text-xs">
                                <Plus className="mr-2 h-3 w-3" /> Add Temporary Staff
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart Mockup */}
            <Card className="glass-dark border-white/5 py-6">
                <CardHeader>
                    <CardTitle>Revenue Insights</CardTitle>
                    <CardDescription>Monthly growth and distribution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 w-full flex items-end gap-2 px-4">
                        {[40, 60, 45, 90, 75, 100, 85].map((height, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="w-full bg-primary/20 group-hover:bg-primary/40 transition-all rounded-t-lg relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap mb-2">
                                        ₹{(height * 1000).toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-[10px] text-center mt-2 text-muted-foreground uppercase font-bold">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
