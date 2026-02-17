'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/types'
import { storage } from '@/lib/storage'
import { toast } from 'sonner'
import { Loader2, MapPin, Phone, User as UserIcon, Sparkles } from 'lucide-react'

interface ProfileCompletionFormProps {
    user: User
    onComplete: (updatedUser: User) => void
}

export function ProfileCompletionForm({ user, onComplete }: ProfileCompletionFormProps) {
    const [loading, setLoading] = useState(false)
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name === 'Guest Customer' ? '' : user.name,
        whatsapp: user.whatsapp || user.phone || '',
        pincode: user.pincode || '',
        city: user.city || '',
        state: user.state || ''
    })

    // Auto-detect city and state from pincode
    useEffect(() => {
        if (formData.pincode.length === 6) {
            handlePincodeLookup(formData.pincode)
        }
    }, [formData.pincode])

    const handlePincodeLookup = async (pin: string) => {
        setPincodeLoading(true)
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
            const data = await res.json()

            if (data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0]
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.District,
                    state: postOffice.State
                }))
                toast.success(`Detected: ${postOffice.District}, ${postOffice.State}`)
            } else {
                toast.error('Invalid Pincode')
            }
        } catch (error) {
            console.error('Pincode lookup failed:', error)
        } finally {
            setPincodeLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.whatsapp || !formData.pincode || !formData.city) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)
        try {
            const updatedUser = {
                ...user,
                name: formData.name,
                whatsapp: formData.whatsapp,
                pincode: formData.pincode,
                city: formData.city,
                state: formData.state
            }

            const success = await storage.updateUser(updatedUser)
            if (success) {
                toast.success('Profile completed successfully!')
                onComplete(updatedUser)
            } else {
                toast.error('Failed to update profile')
            }
        } catch (error) {
            toast.error('An error occurred while saving profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md glass-dark border-white/10" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Please provide your basic details to continue exploring and booking your events.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="Your Name"
                                className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="whatsapp"
                                placeholder="+91 XXXXX XXXXX"
                                className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                                value={formData.whatsapp}
                                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="pincode"
                                    placeholder="606701"
                                    maxLength={6}
                                    className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                                    value={formData.pincode}
                                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                    required
                                />
                                {pincodeLoading && (
                                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                placeholder="City"
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                                value={formData.city}
                                readOnly
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            placeholder="State"
                            className="bg-white/5 border-white/10 focus:border-primary/50"
                            value={formData.state}
                            readOnly
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-background font-bold shadow-lg shadow-primary/20 h-12"
                        disabled={loading || pincodeLoading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Save & Explore
                            </span>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
