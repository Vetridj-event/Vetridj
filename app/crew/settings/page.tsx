'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { storage } from '@/lib/storage'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Shield, Phone, Mail } from 'lucide-react'

export default function CrewSettings() {
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        password: user?.password || ''
    })

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        const updatedUser = { ...user, ...formData }
        const success = await storage.updateUser(updatedUser)

        if (success) {
            toast.success('Profile updated successfully!')
            // We might need to refresh the auth context here if login session depends on it
        } else {
            toast.error('Failed to update profile.')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-muted-foreground">Manage your profile and account security.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-dark border-white/10 scale-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Information
                        </CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10 bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary text-background font-bold h-11">
                                {loading ? 'Saving...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-white/10 scale-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-400" /> Security
                        </CardTitle>
                        <CardDescription>Manage your account password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Change Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter new password"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <Button type="submit" variant="outline" disabled={loading} className="w-full border-white/10 hover:bg-white/5 h-11 transition-all">
                                {loading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
