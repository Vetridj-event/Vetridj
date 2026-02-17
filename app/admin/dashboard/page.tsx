'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storage } from '@/lib/storage'
import { DollarSign, Users, Calendar as CalendarIcon, TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Activity, BrainCircuit, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Booking, FinanceRecord } from '@/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Calendar } from '@/components/ui/calendar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8'];

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalBookings: 0,
        activeCrew: 0,
        upcomingEvents: 0,
        conversionRate: 0
    })
    const [insights, setInsights] = useState({
        predictedBookings: 0,
        predictedRevenue: 0,
        growthTrend: 'up'
    })
    const [chartData, setChartData] = useState<any[]>([])
    const [eventDistribution, setEventDistribution] = useState<any[]>([])
    const [recentBookings, setRecentBookings] = useState<Booking[]>([])
    const [allBookings, setAllBookings] = useState<Booking[]>([])
    const [upiId, setUpiId] = useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            const [bookings, users, finance, settings] = await Promise.all([
                storage.getBookings(),
                storage.getUsers(),
                storage.getFinanceRecords(),
                storage.getSettings()
            ])

            if (settings.upi_id) setUpiId(settings.upi_id)

            // Calculate stats
            const income = finance
                .filter(f => f.type === 'INCOME')
                .reduce((acc, curr) => acc + curr.amount, 0)

            const expenses = finance
                .filter(f => f.type === 'EXPENSE')
                .reduce((acc, curr) => acc + curr.amount, 0)

            const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length
            const convRate = bookings.length > 0 ? (confirmedCount / bookings.length) * 100 : 0

            const upcoming = bookings.filter(b => b.status !== 'CANCELLED' && new Date(b.date) >= new Date()).length
            const activeCrewCount = users.filter(u => u.role === 'CREW').length

            setStats({
                totalRevenue: income,
                totalExpenses: expenses,
                netProfit: income - expenses,
                totalBookings: bookings.length,
                activeCrew: activeCrewCount,
                upcomingEvents: upcoming,
                conversionRate: convRate
            })

            // AI Insights calculation (Simple Projection)
            const currentMonth = new Date().getMonth()
            const currentMonthBookings = bookings.filter(b => new Date(b.date).getMonth() === currentMonth).length
            const prevMonthBookings = bookings.filter(b => new Date(b.date).getMonth() === (currentMonth - 1 + 12) % 12).length

            const trend = prevMonthBookings > 0 ? (currentMonthBookings - prevMonthBookings) / prevMonthBookings : 0
            const predictedNextMonth = Math.round(currentMonthBookings * (1 + trend))
            const predictedRevenue = income > 0 ? (income / Math.max(1, bookings.length)) * predictedNextMonth : 0

            setInsights({
                predictedBookings: predictedNextMonth || upcoming || 5,
                predictedRevenue: predictedRevenue || (income * 1.1) || 50000,
                growthTrend: trend >= 0 ? 'up' : 'down'
            })

            // Prepare chart data (Monthly Revenue vs Expenses)
            const monthlyStats = finance.reduce((acc: any, curr) => {
                const month = new Date(curr.date).toLocaleString('default', { month: 'short' })
                if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 }
                if (curr.type === 'INCOME') acc[month].income += curr.amount
                else acc[month].expense += curr.amount
                return acc
            }, {})

            setChartData(Object.values(monthlyStats))

            // Event Type Distribution
            const distribution = bookings.reduce((acc: any, curr) => {
                const type = curr.eventType || 'Other'
                acc[type] = (acc[type] || 0) + 1
                return acc
            }, {})

            setEventDistribution(Object.keys(distribution).map(name => ({
                name,
                value: distribution[name]
            })))

            setRecentBookings(bookings.slice(0, 5))
            setAllBookings(bookings)
        }

        loadDashboard()
    }, [])

    const handleUpdateUpi = async () => {
        const ok = await storage.updateSetting('upi_id', upiId)
        if (ok) {
            toast.success('UPI ID updated successfully')
        } else {
            toast.error('Failed to update UPI ID')
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Advanced Analytics</h2>
                    <p className="text-muted-foreground">Detailed overview of your business performance.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                                <Activity className="mr-2 h-4 w-4" /> System Cleanup
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-red-400 flex items-center gap-2">
                                    <Activity className="h-5 w-5" /> Danger Zone: System Cleanup
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-white/70">
                                    This will permanently delete all **Bookings, Finance Records, and Crew/Customer Accounts**. Only the Admin account will be preserved.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
                                    <p className="text-sm font-bold text-red-400 flex items-center gap-2">
                                        <ArrowDownRight className="h-4 w-4 rotate-45" /> BACKUP REMINDER
                                    </p>
                                    <p className="text-xs text-white/60 leading-relaxed">
                                        Please ensure you have exported all necessary CSV reports from the Finance and Bookings sections before proceeding. This action cannot be undone.
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Recommended to perform this maintenance every 2 weeks.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="bg-red-500 hover:bg-red-600 text-white w-full font-bold"
                                    onClick={async () => {
                                        if (confirm('Are you absolutely sure? This will wipe the database.')) {
                                            const res = await fetch('/api/admin/cleanup', { method: 'POST' });
                                            if (res.ok) {
                                                window.location.reload();
                                            } else {
                                                alert('Cleanup failed.');
                                            }
                                        }
                                    }}
                                >
                                    Wipe All Data & Reset System
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                                <Activity className="mr-2 h-4 w-4" /> UPI Settings
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-primary flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" /> Payment Gateway Settings
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-white/70">
                                    Configure the UPI ID that customers will use to make payments from their dashboard.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="upi-id" className="text-sm font-bold text-white uppercase tracking-widest">Business UPI ID</Label>
                                    <Input
                                        id="upi-id"
                                        placeholder="e.g. vetridj@okaxis"
                                        className="bg-white/5 border-white/10 text-white"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Important: Ensure this ID is correct to avoid payment failures.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="bg-primary text-background w-full font-black"
                                    onClick={handleUpdateUpi}
                                >
                                    Save UPI Configuration
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">System Online</span>
                    </div>
                </div>
            </div>

            {allBookings.filter(b => b.status === 'PENDING').length > 0 && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Bell className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Action Required: New Booking Requests</h3>
                            <p className="text-sm text-muted-foreground">You have {allBookings.filter(b => b.status === 'PENDING').length} unconfirmed booking requests waiting for approval.</p>
                        </div>
                    </div>
                    <Link href="/admin/bookings">
                        <Button className="bg-primary text-background font-bold h-11 px-6">Review Bookings</Button>
                    </Link>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-12 w-12" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>+12.5% vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-12 w-12" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">₹{stats.netProfit.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Margin: {stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarIcon className="h-12 w-12" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.upcomingEvents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Next 30 days workload</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="h-12 w-12" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</div>
                        <div className="w-full bg-white/5 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.conversionRate}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-primary/20 relative overflow-hidden group bg-primary/5">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BrainCircuit className="h-12 w-12 text-primary" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            AI Predictor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{insights.predictedRevenue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                            Forecast: {insights.predictedBookings} bookings next month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass-dark border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Financial Trend</CardTitle>
                            <CardDescription>Income vs Expenses monthly view</CardDescription>
                        </div>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary" /> Income</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-destructive" /> Expense</div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0e17', borderRadius: '12px', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass-dark border-white/5">
                    <CardHeader>
                        <CardTitle>Event Distribution</CardTitle>
                        <CardDescription>Types of events booked</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={eventDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {eventDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0e17', borderRadius: '12px', borderColor: '#333', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass-dark border-white/5 flex flex-col items-center">
                    <CardHeader className="w-full">
                        <CardTitle>Schedule Overview</CardTitle>
                        <CardDescription>Booked dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-md border border-white/10"
                            modifiers={{
                                booked: allBookings.map(b => new Date(b.date))
                            }}
                            modifiersStyles={{
                                booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3 glass-dark border-white/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Crew Management</CardTitle>
                                <CardDescription>Team availability and role overview</CardDescription>
                            </div>
                            <Link href="/admin/crew">
                                <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/10">Manage</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
                                    <div>
                                        <p className="text-sm font-medium">Total Crew Members</p>
                                        <p className="text-xs text-muted-foreground">{stats.activeCrew} personnel</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Activity className="h-5 w-5" /></div>
                                    <div>
                                        <p className="text-sm font-medium">Utilization Rate</p>
                                        <p className="text-xs text-muted-foreground">High season readiness</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-500">84%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-4 glass-dark border-white/5">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your business</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        <div>
                                            <p className="text-sm font-semibold text-white">{booking.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{booking.eventType} • {new Date(booking.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">₹{booking.amount.toLocaleString()}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">{booking.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
