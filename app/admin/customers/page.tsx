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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    User as UserIcon,
    Calendar,
    IndianRupee,
    Phone,
    MapPin,
    Plus,
    Edit,
    Trash,
    Loader2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function CustomersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        phone: '',
        role: 'CUSTOMER',
        password: 'password123'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [allUsers, allBookings] = await Promise.all([
                storage.getUsers(),
                storage.getBookings()
            ])
            setUsers(allUsers.filter(u => u.role === 'CUSTOMER'))
            setBookings(allBookings)
        } catch (error) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and Email are required')
            return
        }

        try {
            if (editingUser) {
                await storage.updateUser({ ...editingUser, ...formData } as User)
                toast.success('Customer updated')
            } else {
                const newUser: User = {
                    ...formData as User,
                    id: `cust-${Date.now()}`,
                    role: 'CUSTOMER'
                }
                await storage.addUser(newUser)
                toast.success('Customer added')
            }
            loadData()
            setIsDialogOpen(false)
            setEditingUser(null)
            setFormData({ name: '', email: '', phone: '', role: 'CUSTOMER', password: 'password123' })
        } catch (error) {
            toast.error('Failed to save customer')
        }
    }

    const openEdit = (user: User) => {
        setEditingUser(user)
        setFormData(user)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer? This will NOT delete their bookings.')) return
        try {
            await storage.deleteUser(id)
            toast.success('Customer deleted')
            loadData()
        } catch (error) {
            toast.error('Failed to delete customer')
        }
    }

    const getCustomerStats = (userId: string) => {
        const customerBookings = bookings.filter(b => b.customerId === userId)
        const totalSpent = customerBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
        const lastBooking = customerBookings.length > 0
            ? customerBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : 'No events'

        return {
            count: customerBookings.length,
            spent: totalSpent,
            lastDate: lastBooking
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && users.length === 0) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Customer CRM</h2>
                    <p className="text-muted-foreground">Manage your client database and see their history.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => { setEditingUser(null); setFormData({ role: 'CUSTOMER', password: 'password123' }) }}
                            className="bg-primary hover:bg-primary/90 text-background font-bold"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        placeholder="Min 6 chars"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} className="w-full bg-primary text-background font-bold">
                                {editingUser ? 'Update Customer' : 'Create Customer'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                    />
                </div>
            </div>

            <Card className="glass-dark border-white/5 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Customer Directory</CardTitle>
                            <CardDescription>Total {users.length} registered customers.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="py-4 pl-6">Customer</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => {
                                    const stats = getCustomerStats(user.id)
                                    return (
                                        <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                                                        <UserIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white mb-0.5">{user.name}</p>
                                                        {stats.count > 2 && <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 text-[10px] py-0 px-2 h-4">Loyal Client</Badge>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                                        <Phone className="h-3 w-3 text-primary/50" />
                                                        {user.whatsapp || user.phone || 'N/A'}
                                                        {user.whatsapp && <Badge className="ml-1 bg-green-500/20 text-green-500 border-none text-[8px] h-3 px-1">WA</Badge>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                                        <MapPin className="h-3 w-3 text-primary/50" />
                                                        {user.city ? `${user.city}${user.pincode ? `, ${user.pincode}` : ''}` : 'No address'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-primary/20 text-primary border-none text-[10px]">
                                                            {stats.count} Events
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">Last: {stats.lastDate}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-bold text-white">
                                                    <IndianRupee className="h-3 h-3 text-primary" />
                                                    {stats.spent.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEdit(user)}
                                                        className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id)}
                                                        className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
