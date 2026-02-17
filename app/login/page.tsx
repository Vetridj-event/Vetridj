'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { MusicalNotes } from '@/components/musical-notes'
import { Loader2, Lock, Mail, ChevronLeft, Phone, ShieldCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'ID' | 'OTP' | 'PASSWORD'>('ID')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { user, login, loginWithOTP, generateOTP, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            const roleRedirects = {
                'ADMIN': '/admin/dashboard',
                'CUSTOMER': '/customer/dashboard',
                'CREW': '/crew/dashboard'
            }
            router.push(roleRedirects[user.role] || '/customer/dashboard')
        }
    }, [isAuthenticated, isLoading, user, router])

    useEffect(() => {
        // Create audio element for notification
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
    }, [])

    const handleIdentifierSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Detect if it's a phone number (at least 10 digits when stripped)
        const stripped = identifier.replace(/\D/g, '')
        const isPhone = stripped.length >= 10 && !identifier.includes('@')

        if (isPhone) {
            try {
                const res = await fetch('/api/users')
                if (!res.ok) throw new Error('API failed')
                const users = await res.json()

                // Helper to normalize for lookup
                const normalize = (p: string) => {
                    const d = p.replace(/\D/g, '')
                    return d.length > 10 ? d.slice(-10) : d
                }
                const normalizedInput = normalize(identifier)
                const user = users.find((u: any) => normalize(u.phone || '') === normalizedInput)

                if (user && (user.role === 'ADMIN' || user.role === 'CREW')) {
                    setStep('PASSWORD')
                    toast.info('Team member detected. Please sign in with password.')
                } else {
                    // Send OTP simulated
                    setStep('OTP')
                    const newOtp = generateOTP()
                    setTimeout(() => {
                        if (audioRef.current) audioRef.current.play().catch(() => { })
                        toast.success(`OTP: ${newOtp} (Simulated)`, {
                            duration: 5000,
                            description: 'In a production environment, this would be sent to your mobile.'
                        })
                        // Auto-fill OTP for demo
                        setOtp(newOtp)
                    }, 800)
                }
            } catch (err) {
                // Fallback to OTP flow if API fails or user not found
                setStep('OTP')
                setOtp('123456')
            }
        } else {
            setStep('PASSWORD')
        }
        setLoading(false)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const success = await login(identifier, password)
            if (success) {
                // Redirection is handled by AuthContext
            } else {
                setError('Invalid credentials. Please try again.')
            }
        } catch (err) {
            setError('An error occurred during login.')
        } finally {
            setLoading(false)
        }
    }

    const handleOTPVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (otp.length !== 6 && otp !== '') return

        setLoading(true)
        setError('')

        try {
            const success = await loginWithOTP(identifier, otp)
            if (success) {
                // Redirection is handled by useEffect in AuthProvider or above
            } else {
                setError('Invalid OTP. Please try again.')
            }
        } catch (err) {
            setError('An error occurred during verification.')
        } finally {
            setLoading(false)
        }
    }

    // Auto-apply logic for OTP
    useEffect(() => {
        if (step === 'OTP' && otp.length === 6) {
            handleOTPVerify()
        }
    }, [otp, step])

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            <MusicalNotes />

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Link
                    href="/"
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-primary/20 mr-2 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    Back to Home
                </Link>

                <Card className="glass-dark border-white/10 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>

                    <CardHeader className="space-y-2 text-center pt-8">
                        <div className="mx-auto mb-2 w-16 h-16 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {step === 'OTP' ? 'Verify OTP' : 'Welcome Back'}
                        </CardTitle>
                        <CardDescription>
                            {step === 'ID' && 'Enter your email or mobile number to continue'}
                            {step === 'OTP' && `We've sent a 6-digit code to ${identifier}`}
                            {step === 'PASSWORD' && 'Enter your password to sign in'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {step === 'ID' && (
                            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id">Email or Mobile Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="id"
                                            type="text"
                                            placeholder="9876543210 or email@example.com"
                                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-background font-bold shadow-lg shadow-primary/25 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                                </Button>
                            </form>
                        )}

                        {step === 'PASSWORD' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-pulse">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-white/10"
                                        onClick={() => setStep('ID')}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] bg-primary hover:bg-primary/90 text-background font-bold shadow-lg shadow-primary/25"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {step === 'OTP' && (
                            <form onSubmit={handleOTPVerify} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-center block text-muted-foreground uppercase text-[10px] font-black tracking-widest">Verification Code</Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-primary/50" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="••••••"
                                            maxLength={6}
                                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-foreground text-center text-2xl tracking-[0.4em] font-black h-12"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] text-muted-foreground">Didn't receive code?</p>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-[10px] font-bold text-primary p-0 h-auto hover:no-underline"
                                            onClick={() => {
                                                const newOtp = generateOTP()
                                                if (audioRef.current) audioRef.current.play().catch(() => { })
                                                toast.success(`OTP Resent: ${newOtp}`)
                                                setOtp(newOtp)
                                            }}
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" /> Re-send code
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-pulse">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                                        onClick={() => setStep('ID')}
                                    >
                                        Change Number
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-tight shadow-lg shadow-primary/25"
                                        disabled={loading || otp.length !== 6}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Entry'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center pt-4 border-t border-white/5">
                            <p className="text-sm text-muted-foreground">
                                New to Vetri DJ?{' '}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline font-bold"
                                >
                                    Register Now
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
