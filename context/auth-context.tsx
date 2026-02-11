'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { storage } from '@/lib/storage'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
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

    const login = async (email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const validUser = await storage.login(email, password)
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
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
