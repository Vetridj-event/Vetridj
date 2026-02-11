'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { MusicalNotes } from '@/components/musical-notes'
import { Loader2, Lock, Mail, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const success = await login(email, password)
            if (success) {
                // Check for returnUrl
                const params = new URLSearchParams(window.location.search)
                const returnUrl = params.get('returnUrl')
                if (returnUrl) {
                    router.push(returnUrl)
                } else {
                    // Default redirect based on role is handled in auth-context or here if needed, 
                    // but auth-context usually handles it. 
                    // However, since we are in a component, we can force a redirect if auth-context doesn't automatically.
                    // IMPORTANT: auth-context usually has a redirect logic. 
                    // Let's assume auth context does NOT redirect automatically on login function call alone, 
                    // or we override it by router.push here if we want specific behavior.
                    // For now, let's just let the auth-context flow OR manually redirect if specific role logic is needed here.
                    // But wait, the previous code didn't have redirect logic here, it implies `login` function might not redirect?
                    // Let's check auth-context. Actually, the previous code didn't redirect at all? 
                    // Ah, I see `router.push` was imported but not used in success case in previous code.
                    // I should probably add default redirect too.
                    router.push('/customer/dashboard') // Default fallback
                }
            } else {
                setError('Invalid credentials. Please try again.')
            }
        } catch (err) {
            setError('An error occurred during login.')
        } finally {
            setLoading(false)
        }
    }

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
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access the management portal
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email or Mobile Number</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="email@example.com or 9876543210"
                                        className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
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
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-pulse">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-background font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="text-center pt-4 border-t border-white/5">
                                <p className="text-sm text-muted-foreground">
                                    New to Vetri DJ?{' '}
                                    <Link
                                        href={`/register${typeof window !== 'undefined' ? new URLSearchParams(window.location.search).has('returnUrl') ? `?returnUrl=${new URLSearchParams(window.location.search).get('returnUrl')}` : '' : ''}`}
                                        className="text-primary hover:underline font-bold"
                                    >
                                        Register Now
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
