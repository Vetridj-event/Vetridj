'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Plus, Search, Edit, Trash2, Phone, Mail, DollarSign, Loader2, Wallet, XCircle, Share2, Key } from 'lucide-react'
import { storage } from '@/lib/storage'
import { User as UserType, Booking } from '@/types'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function CrewManagementPage() {
    const [crew, setCrew] = useState<UserType[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<UserType | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState<Partial<UserType>>({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'CREW',
        salary: 0,
        password: 'password123'
    })

    const [payoutStats, setPayoutStats] = useState({
        totalPaid: 0,
        pendingMonth: 0,
        averageSalary: 0
    })

    const fetchCrew = async () => {
        try {
            setLoading(true)
            const [users, finance] = await Promise.all([
                storage.getUsers(),
                storage.getFinanceRecords()
            ])
            const crewMembers = users.filter(u => u.role === 'CREW')
            setCrew(crewMembers)

            // Calculate payout stats
            const salaryPayments = finance.filter(f => f.type === 'EXPENSE' && (f.category === 'Salary' || f.description.toLowerCase().includes('payout')))
            const total = salaryPayments.reduce((acc, curr) => acc + curr.amount, 0)
            const avg = crewMembers.length > 0 ? crewMembers.reduce((acc, curr) => acc + (curr.salary || 0), 0) / crewMembers.length : 0

            setPayoutStats({
                totalPaid: total,
                pendingMonth: crewMembers.reduce((acc, curr) => acc + (curr.salary || 0), 0),
                averageSalary: avg
            })
        } catch (error) {
            toast.error('Failed to load crew members')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCrew()
    }, [])

    const handleRecordPayout = async (member: UserType) => {
        const amount = member.salary || 0
        if (amount <= 0) {
            toast.error('No salary set for this member')
            return
        }

        const confirmPay = confirm(`Record a payout of ₹${amount.toLocaleString()} for ${member.name}?`)
        if (!confirmPay) return

        try {
            const ok = await storage.addFinanceRecord({
                id: `fin-${Date.now()}`,
                type: 'EXPENSE',
                amount: amount,
                category: 'Salary',
                date: new Date().toISOString(),
                description: `Monthly payout for ${member.name}`
            })

            if (ok) {
                toast.success(`Payout recorded for ${member.name}`)
                fetchCrew()
            } else {
                toast.error('Failed to record payout')
            }
        } catch (error) {
            toast.error('Error recording payout')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (editingMember) {
                const ok = await storage.updateUser({ ...editingMember, ...formData } as UserType)
                if (ok) {
                    toast.success('Crew member updated!')
                    setIsDialogOpen(false)
                    fetchCrew()
                } else {
                    toast.error('Failed to update')
                }
            } else {
                const ok = await storage.addUser({
                    ...formData,
                    id: formData.id || `crew-${Date.now()}`,
                    role: 'CREW',
                    joinedDate: new Date().toISOString()
                } as UserType)
                if (ok) {
                    toast.success('Crew member added!')
                    setIsDialogOpen(false)
                    fetchCrew()
                } else {
                    toast.error('Failed to add member')
                }
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const openEdit = (member: UserType) => {
        setEditingMember(member)
        setFormData(member)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return
        try {
            const ok = await storage.deleteUser(id)
            if (ok) {
                toast.success('Crew member removed')
                fetchCrew()
            } else {
                toast.error('Failed to remove')
            }
        } catch (error) {
            toast.error('Error deleting member')
        }
    }

    const filteredCrew = crew.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleShareCredentials = (member: UserType) => {
        const message = `👋 Hi ${member.name},

Your Vetri DJ Crew account has been created! 🎧🔥

━━━━━━━━━━━━━━━
🔐 YOUR CREDENTIALS
User ID: ${member.id}
Password: ${member.password}
━━━━━━━━━━━━━━━

Login at: ${window.location.origin}/login

Welcome to the team! 🎉`

        const phone = member.phone?.replace(/\D/g, '')
        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <User className="h-8 w-8 text-primary" /> Crew Management
                    </h1>
                    <p className="text-muted-foreground">Manage your team members and their compensation.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingMember(null); setFormData({ id: '', name: '', email: '', phone: '', salary: 0, password: 'password123', role: 'CREW' }) }} className="bg-primary hover:bg-primary/90 text-background font-bold gap-2">
                            <Plus className="h-4 w-4" /> Add Crew Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10">
                        <DialogHeader>
                            <DialogTitle>{editingMember ? 'Edit Crew Member' : 'Add New Crew Member'}</DialogTitle>
                            <DialogDescription>
                                {editingMember ? 'Update personnel details and compensation.' : "Create a new account for a staff member. Default password is 'password123'."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    className="bg-white/5 border-white/10"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Rahul Kumar"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>User ID (Custom)</Label>
                                <Input
                                    className="bg-white/5 border-white/10 font-mono"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    required
                                    placeholder="e.g. rahul_dj"
                                    disabled={!!editingMember}
                                />
                                <p className="text-[10px] text-muted-foreground italic">This will be used for logging in.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address (Optional)</Label>
                                <Input
                                    type="email"
                                    className="bg-white/5 border-white/10"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="rahul@vetridj.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mobile Number</Label>
                                    <Input
                                        className="bg-white/5 border-white/10"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Salary (₹)</Label>
                                    <Input
                                        type="number"
                                        className="bg-white/5 border-white/10"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            </div>
                            {!editingMember && (
                                <div className="space-y-2">
                                    <Label>Default Password</Label>
                                    <Input
                                        type="text"
                                        className="bg-white/5 border-white/10"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <Button type="submit" className="w-full font-bold bg-primary text-background" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingMember ? 'Update Member' : 'Create Account'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" /> Total Payouts
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">₹{payoutStats.totalPaid.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Cumulative salary disbursements</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" /> Active Crew
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">{crew.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Personnel currently in the system</p>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-orange-400" /> Monthly Commitment
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">₹{payoutStats.pendingMonth.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Estimated monthly salary pool</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-dark border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div className="space-y-1">
                        <CardTitle>Crew Roster</CardTitle>
                        <CardDescription>Total {crew.length} active staff members</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search crew..."
                            className="pl-8 bg-white/5 border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-white font-bold">Name</TableHead>
                                    <TableHead className="text-white font-bold">Contact Info</TableHead>
                                    <TableHead className="text-white font-bold">Monthly Salary</TableHead>
                                    <TableHead className="text-right text-white font-bold pr-6">Quick Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && crew.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCrew.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                            No crew members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCrew.map((member) => (
                                        <TableRow key={member.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-primary/5">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                            {member.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-bold text-white">{member.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                                        <Mail className="w-3 h-3 text-primary/50" /> {member.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                                        <Key className="w-3 h-3 text-primary/50" /> ID: <span className="font-mono">{member.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                                        <Phone className="w-3 h-3 text-primary/50" /> {member.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 font-bold text-green-400">
                                                    <IndianRupee className="w-3.5 h-3.5" />
                                                    {member.salary?.toLocaleString() || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all font-bold px-3"
                                                        onClick={() => handleRecordPayout(member)}
                                                    >
                                                        <Wallet className="h-3.5 w-3.5 mr-1.5" /> Payout
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all font-bold px-3"
                                                        onClick={() => handleShareCredentials(member)}
                                                    >
                                                        <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white/10 hover:text-primary transition-colors"
                                                        onClick={() => openEdit(member)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white/10 hover:text-red-500 transition-colors"
                                                        onClick={() => handleDelete(member.id, member.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function IndianRupee(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 3h12" />
            <path d="M6 8h12" />
            <path d="m6 13 8.5 8" />
            <path d="M6 13h3" />
            <path d="M9 13c6.667 0 6.667-10 0-10" />
        </svg>
    )
}
