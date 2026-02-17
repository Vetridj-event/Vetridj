'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { MusicalNotes } from '@/components/musical-notes'
import { Loader2, User, Phone, MessageSquare, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step < 2) {
            setStep(step + 1)
            return
        }

        setLoading(true)
        setError('')

        try {
            const normalizedPhone = phone.replace(/\D/g, '').length > 10 ? phone.replace(/\D/g, '').slice(-10) : phone.replace(/\D/g, '')
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email: `${normalizedPhone}@customer.com`, // Internal fallback
                    password: 'otp_auth', // Default for OTP users
                    phone: normalizedPhone,
                    whatsapp: (whatsapp || phone).replace(/\D/g, '').length > 10 ? (whatsapp || phone).replace(/\D/g, '').slice(-10) : (whatsapp || phone).replace(/\D/g, ''),
                    role: 'CUSTOMER'
                })
            })

            if (res.ok) {
                const params = new URLSearchParams(window.location.search)
                const returnUrl = params.get('returnUrl')
                const redirectPath = `/login?registered=true&identifier=${normalizedPhone}` + (returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : '')
                router.push(redirectPath)
                toast.success('Registration successful! Use OTP to log in.')
            } else {
                const data = await res.json()
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const prevStep = () => setStep(step - 1)

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            <MusicalNotes />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-4 py-12">
                <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <Card className="glass-dark border-white/10 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {step === 1 && "What's your name?"}
                            {step === 2 && "How can we reach you?"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Let's start with your full name"}
                            {step === 2 && "Enter your contact details for bookings"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            {step === 1 && (
                                <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            placeholder="Enter your name"
                                            className="pl-10 bg-white/5 border-white/10 h-11"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Mobile Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                className="pl-10 bg-white/5 border-white/10 h-11"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="whatsapp"
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                className="pl-10 bg-white/5 border-white/10 h-11"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">We'll use this for booking confirmations and receipts.</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-11 border-white/10"
                                        onClick={prevStep}
                                        disabled={loading}
                                    >
                                        Back
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    className="flex-[2] h-11 bg-primary text-background font-bold shadow-lg shadow-primary/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (step === 2 ? 'Complete Registration' : 'Next Step')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/5 pt-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Login</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
