'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { storage } from '@/lib/storage'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    login: (identifier: string, password: string) => Promise<boolean>
    loginWithOTP: (phone: string, otp: string) => Promise<boolean>
    generateOTP: () => string
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('vetri_session')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (identifier: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const validUser = await storage.login(identifier, password)
        if (validUser) {
            setUser(validUser)
            localStorage.setItem('vetri_session', JSON.stringify(validUser))

            // Set cookie for middleware/proxy access
            const sessionData = encodeURIComponent(JSON.stringify(validUser))
            document.cookie = `vetri_session=${sessionData}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

            // Redirect based on role
            if (validUser.role === 'ADMIN') {
                router.push('/admin/dashboard')
            } else if (validUser.role === 'CUSTOMER') {
                router.push('/customer/dashboard')
            } else {
                router.push('/crew/dashboard')
            }
            return true
        }
        return false
    }

    const normalizePhone = (phone: string) => {
        const digits = phone.replace(/\D/g, '')
        return digits.length > 10 ? digits.slice(-10) : digits
    }

    const [activeOTP, setActiveOTP] = useState<string | null>(null)

    const generateOTP = () => {
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
        setActiveOTP(newOTP)
        return newOTP
    }

    const loginWithOTP = async (phone: string, otp: string) => {
        // Simulate OTP verification
        await new Promise(resolve => setTimeout(resolve, 800))

        const normalizedInput = normalizePhone(phone)

        // Verify against activeOTP (or fallback to '123456' for safety during transition/demo)
        if (otp === activeOTP || otp === '123456') {
            const users = await storage.getUsers()
            let validUser = users.find(u => {
                const normalizedUserPhone = normalizePhone(u.phone || '')
                return normalizedUserPhone === normalizedInput && u.role === 'CUSTOMER'
            })

            // If user doesn't exist, Create a guest/new customer record
            if (!validUser) {
                const newUser: User = {
                    id: `cust-${Date.now()}`,
                    name: 'Guest Customer',
                    phone: phone, // Store original for reference
                    role: 'CUSTOMER',
                    password: 'otp_auth',
                    joinedDate: new Date().toISOString()
                }
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                })
                if (res.ok) validUser = newUser
            }

            if (validUser) {
                setUser(validUser)
                setActiveOTP(null) // Clear OTP after login
                localStorage.setItem('vetri_session', JSON.stringify(validUser))
                const sessionData = encodeURIComponent(JSON.stringify(validUser))
                document.cookie = `vetri_session=${sessionData}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

                // Redirect based on role
                if (validUser.role === 'ADMIN') {
                    router.push('/admin/dashboard')
                } else if (validUser.role === 'CUSTOMER') {
                    router.push('/customer/dashboard')
                } else {
                    router.push('/crew/dashboard')
                }
                return true
            }
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('vetri_session')
        document.cookie = 'vetri_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax'
        router.push('/login')
    }

    // Route protection
    useEffect(() => {
        if (isLoading) return

        const isAdminRoute = pathname.startsWith('/admin')
        const isCrewRoute = pathname.startsWith('/crew')
        const isCustomerRoute = pathname.startsWith('/customer')

        if ((isAdminRoute || isCrewRoute || isCustomerRoute) && !user) {
            router.push('/login')
            return
        }

        if (isAdminRoute && user?.role !== 'ADMIN') {
            if (user?.role === 'CUSTOMER') router.push('/customer/dashboard')
            else router.push('/crew/dashboard')
        }

        if (isCrewRoute && user?.role !== 'CREW' && user?.role !== 'ADMIN') {
            if (user?.role === 'CUSTOMER') router.push('/customer/dashboard')
            else router.push('/admin/dashboard') // Should only happen if user is logged in but lost role
        }

        if (isCustomerRoute && user?.role !== 'CUSTOMER') {
            if (user?.role === 'ADMIN') router.push('/admin/dashboard')
            else router.push('/crew/dashboard')
        }
    }, [pathname, user, isLoading, router])

    return (
        <AuthContext.Provider value={{ user, login, loginWithOTP, logout, isAuthenticated: !!user, isLoading, generateOTP }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
