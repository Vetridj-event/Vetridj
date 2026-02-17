'use client'

import { Booking, User, FinanceRecord } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Calendar,
    Users,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Activity,
    User as UserIcon,
    Clock,
    MapPin
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface BookingReportModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    booking: Booking
    crewMembers: User[]
    financeRecords: FinanceRecord[]
}

export function BookingReportModal({
    isOpen,
    onOpenChange,
    booking,
    crewMembers,
    financeRecords
}: BookingReportModalProps) {
    const relatedFinance = financeRecords.filter(f => f.relatedBookingId === booking.id)
    const expenses = relatedFinance
        .filter(f => f.type === 'EXPENSE')
        .reduce((acc, curr) => acc + curr.amount, 0)

    // Revenue is the total booking amount
    const revenue = booking.amount
    const profit = revenue - expenses
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

    const assignedCrewData = crewMembers.filter(m => booking.crewAssigned?.includes(m.id))

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="glass-dark border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-white/5 pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 uppercase tracking-widest text-[10px]">HR EVENT REPORT</Badge>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                                {booking.customerName}'s Event
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(booking.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {booking.location || 'Chengam, TN'}</span>
                                    <Badge variant="outline" className="border-primary/20 text-primary capitalize">{booking.status}</Badge>
                                </div>
                            </DialogDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Booking ID</p>
                            <p className="text-lg font-mono font-bold text-white">#{booking.id.split('-')[1] || booking.id}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6 pt-6">
                    {/* Financial Overview Cards */}
                    <Card className="glass-dark border-white/5 bg-white/[0.02]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <IndianRupee className="w-3.5 h-3.5 text-green-400" /> Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black text-white">₹{revenue.toLocaleString()}</p>
                            <Progress value={100} className="h-1 mt-3 bg-white/5" />
                        </CardContent>
                    </Card>

                    <Card className="glass-dark border-white/5 bg-white/[0.02]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-red-400" /> Total Expenses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black text-white">₹{expenses.toLocaleString()}</p>
                            <Progress value={(expenses / Math.max(1, revenue)) * 100} className="h-1 mt-3 bg-white/5" />
                        </CardContent>
                    </Card>

                    <Card className="glass-dark border-white/5 bg-primary/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                                <PieChart className="w-3.5 h-3.5" /> Net Profit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black text-white">₹{profit.toLocaleString()}</p>
                            <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> {profitMargin.toFixed(1)}% Margin
                            </p>
                        </CardContent>
                    </Card>

                    {/* Detailed Columns */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="glass-dark border-white/5">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" /> Finance Breakdown & Ledgers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {relatedFinance.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-sm italic">
                                            No additional expense or income records linked to this event.
                                        </div>
                                    ) : (
                                        relatedFinance.map((record) => (
                                            <div key={record.id} className="flex justify-between items-center p-4 hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.type === 'INCOME' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {record.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{record.description}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{record.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${record.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {record.type === 'INCOME' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="glass-dark border-white/5">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" /> Assigned Crew
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {assignedCrewData.length === 0 ? (
                                    <div className="text-center py-4">
                                        <UserIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">No crew assigned yet</p>
                                    </div>
                                ) : (
                                    assignedCrewData.map((crew) => (
                                        <div key={crew.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                                            <Avatar className="h-8 w-8 border border-white/10">
                                                <AvatarImage src={crew.avatar} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">{crew.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white leading-none">{crew.name}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Main Event Handler</p>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-white/5">CREW</Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-dark border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Event Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-xs text-muted-foreground">Balance Status</span>
                                    <span className={`text-sm font-bold ${booking.balanceAmount === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                        {booking.balanceAmount === 0 ? 'Fully Paid' : `₹${booking.balanceAmount?.toLocaleString()} Pending`}
                                    </span>
                                </div>
                                <div className="flex justify-center pt-2">
                                    <div className="text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Profitability Grade</p>
                                        <p className={`text-3xl font-black ${profitMargin > 50 ? 'text-green-400' : 'text-primary'}`}>
                                            {profitMargin > 70 ? 'A+' : profitMargin > 50 ? 'A' : profitMargin > 30 ? 'B' : 'C'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
