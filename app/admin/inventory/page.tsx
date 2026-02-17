'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { InventoryItem, ProductRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Package,
    AlertTriangle,
    CheckCircle,
    Search,
    Edit,
    Trash,
    Plus,
    TrendingDown,
    XCircle,
    Loader2,
    ArrowUpRight
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Inventory Modal
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        category: 'AUDIO',
        quantity: 0,
        totalQuantity: 0,
        status: 'AVAILABLE'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [inv, reqs] = await Promise.all([
                storage.getInventory(),
                storage.getProductRequests()
            ])
            setItems(inv)
            setProductRequests(reqs)
        } catch (error) {
            console.error('Failed to load inventory data:', error)
            toast.error('Error loading data')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('Please enter a name')
            return
        }

        try {
            if (editingItem) {
                await storage.updateInventoryItem({ ...editingItem, ...formData } as InventoryItem)
                toast.success('Item updated')
            } else {
                const newItem: InventoryItem = {
                    id: `inv-${Date.now()}`,
                    name: formData.name || '',
                    category: formData.category || 'Sound',
                    quantity: Number(formData.quantity) || 0,
                    totalQuantity: Number(formData.totalQuantity) || 0,
                    status: formData.status as any || 'AVAILABLE'
                }
                await storage.addInventoryItem(newItem)
                toast.success('Item added')
            }
            loadData()
            setIsDialogOpen(false)
            setEditingItem(null)
            setFormData({ status: 'AVAILABLE', quantity: 0, totalQuantity: 0, category: 'AUDIO' })
        } catch (error) {
            toast.error('Failed to save item')
        }
    }

    const openEdit = (item: InventoryItem) => {
        setEditingItem(item)
        setFormData(item)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            await storage.deleteInventoryItem(id)
            toast.success('Item deleted')
            loadData()
        } catch (error) {
            toast.error('Failed to delete item')
        }
    }

    const handleUpdateStatus = async (request: ProductRequest, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const ok = await storage.updateProductRequest({ ...request, status: newStatus })
            if (ok) {
                toast.success(`Request ${newStatus.toLowerCase()} successfully`)
                loadData()
            }
        } catch (error) {
            toast.error('Failed to update request status')
        }
    }

    const handleDeleteRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return
        try {
            const res = await fetch(`/api/product-requests?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success('Request deleted')
                loadData()
            }
        } catch (error) {
            toast.error('Failed to delete request')
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return <Badge className="bg-green-500/20 text-green-500 border-green-500/20 hover:bg-green-500/30">Available</Badge>
            case 'IN_USE': return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 hover:bg-blue-500/30">In Use</Badge>
            case 'MAINTENANCE': return <Badge className="bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500/30">Maintenance</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading && items.length === 0) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-muted-foreground">Manage equipment, resources, and crew requests.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingItem(null); setFormData({ status: 'AVAILABLE', category: 'AUDIO', quantity: 0, totalQuantity: 0 }) }} className="bg-primary hover:bg-primary/90 text-background font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Item Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AUDIO">Audio</SelectItem>
                                            <SelectItem value="LIGHTING">Lighting</SelectItem>
                                            <SelectItem value="VISUAL">Visual</SelectItem>
                                            <SelectItem value="EFFECTS">Effects</SelectItem>
                                            <SelectItem value="OTHERS">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="IN_USE">In Use</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Current Quantity</Label>
                                    <Input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Stock</Label>
                                    <Input
                                        type="number"
                                        value={formData.totalQuantity}
                                        onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} className="w-full bg-primary text-background font-bold">
                                {editingItem ? 'Update Item' : 'Create Item'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search inventory..."
                    className="pl-10 bg-white/5 border-white/10 w-full md:max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="bg-white/5 border-white/10 mb-6">
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-background">Active Inventory</TabsTrigger>
                    <TabsTrigger value="requests" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white flex gap-2">
                        Crew Requests
                        {productRequests.filter(r => r.status === 'PENDING').length > 0 && (
                            <Badge className="bg-white text-orange-500 border-none px-1.5 h-4 text-[10px]">
                                {productRequests.filter(r => r.status === 'PENDING').length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-6 mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className="glass-dark border-white/10 hover:border-primary/50 transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="mb-2 text-[10px]">{item.category}</Badge>
                                        <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-2xl font-bold">{item.quantity} <span className="text-sm font-normal text-muted-foreground">/ {item.totalQuantity}</span></div>
                                        {getStatusBadge(item.status)}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.quantity < 2 ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${(item.quantity / (item.totalQuantity || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right font-medium">Stock Level</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEdit(item)}
                                            className="text-xs hover:text-primary hover:bg-primary/10"
                                        >
                                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash className="w-3.5 h-3.5 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-0">
                    <div className="rounded-2xl border border-white/10 overflow-hidden glass-dark shadow-xl">
                        <Table>
                            <TableHeader className="bg-white/5 border-none">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="font-bold">Crew Member</TableHead>
                                    <TableHead className="font-bold">Product Required</TableHead>
                                    <TableHead className="font-bold">Quantity</TableHead>
                                    <TableHead className="font-bold">Reason/Requirement</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <CheckCircle className="w-8 h-8 opacity-20" />
                                                <p className="italic">No pending product requests from crew.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    productRequests.map((req) => (
                                        <TableRow key={req.id} className="border-white/10 hover:bg-white/5 group transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                                                        {req.crewName.charAt(0)}
                                                    </div>
                                                    {req.crewName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-orange-400">{req.productName}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-white/10 text-white">x{req.quantity}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{req.requirements || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    req.status === 'PENDING' ? 'text-orange-400 border-orange-400/20 bg-orange-400/5' :
                                                        req.status === 'APPROVED' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                                                            'text-red-400 border-red-400/20 bg-red-400/5'
                                                }>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {req.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 h-8 text-white px-3"
                                                                onClick={() => handleUpdateStatus(req, 'APPROVED')}
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-8 px-3"
                                                                onClick={() => handleUpdateStatus(req, 'REJECTED')}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                                                        onClick={() => handleDeleteRequest(req.id)}
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
                </TabsContent>
            </Tabs>
        </div>
    )
}
