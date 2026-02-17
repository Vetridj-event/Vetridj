'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { InventoryItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Search, Plus, Loader2 } from 'lucide-react'
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
import { useAuth } from '@/context/auth-context'

export default function CrewInventoryPage() {
    const { user } = useAuth()
    const [items, setItems] = useState<InventoryItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [requestData, setRequestData] = useState({
        productName: '',
        requirements: '',
        quantity: 1
    })

    useEffect(() => {
        storage.getInventory().then(setItems)
    }, [])

    const handleRequest = async () => {
        if (!requestData.productName || requestData.quantity <= 0) {
            toast.error('Please fill in product name and quantity')
            return
        }

        setSubmitting(true)
        try {
            const ok = await storage.addProductRequest({
                id: `req-${Date.now()}`,
                crewId: user?.id || 'unknown',
                crewName: user?.name || 'Unknown Crew',
                productName: requestData.productName,
                requirements: requestData.requirements,
                quantity: requestData.quantity,
                status: 'PENDING',
                date: new Date().toISOString()
            })

            if (ok) {
                toast.success('Product request sent to admin')
                setIsRequestModalOpen(false)
                setRequestData({ productName: '', requirements: '', quantity: 1 })
            }
        } catch (error) {
            toast.error('Failed to send request')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Check</h2>
                    <p className="text-muted-foreground">View available equipment for events.</p>
                </div>

                <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-background font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Request Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10 sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Request New Product</DialogTitle>
                            <p className="text-sm text-muted-foreground">Submit a requirement for equipment not in inventory or more stock.</p>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Product/Equipment Name</Label>
                                <Input
                                    value={requestData.productName}
                                    onChange={(e) => setRequestData({ ...requestData, productName: e.target.value })}
                                    placeholder="e.g. JBL SRX 828, Fog Liquid"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 items-end">
                                <div className="col-span-3 space-y-2">
                                    <Label>Requirements / Purpose</Label>
                                    <Input
                                        value={requestData.requirements}
                                        onChange={(e) => setRequestData({ ...requestData, requirements: e.target.value })}
                                        placeholder="Specific reason or event name"
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Qty</Label>
                                    <Input
                                        type="number"
                                        value={requestData.quantity}
                                        onChange={(e) => setRequestData({ ...requestData, quantity: parseInt(e.target.value) || 0 })}
                                        className="bg-white/5 border-white/10 text-center"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleRequest}
                                className="w-full bg-primary text-background font-bold"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit Requirement
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search equipment..."
                    className="pl-10 bg-white/5 border-white/10 w-full md:max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="glass-dark border-white/10">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <Badge variant="outline" className="mb-2 text-xs">{item.category}</Badge>
                                <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{item.quantity} <span className="text-sm font-normal text-muted-foreground">available</span></div>
                                <Badge variant={item.status === 'AVAILABLE' ? 'default' : 'destructive'}>
                                    {item.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
