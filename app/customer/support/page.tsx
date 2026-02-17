'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageSquare, Phone, Mail, Send, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function SupportPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [subject, setSubject] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Simulate sending support request
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Message sent! Our team will contact you shortly.')
            setMessage('')
            setSubject('')
        } catch (error) {
            toast.error('Failed to send message.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Help & Support</h1>
                <p className="text-muted-foreground">We're here to help make your event perfect.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Contact Information */}
                <Card className="glass-dark border-white/5 md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>Reach out directly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">Phone Support</p>
                                <p className="text-sm text-muted-foreground">+91 6381 544 170</p>
                                <p className="text-xs text-muted-foreground mt-1">Mon-Sun, 9AM - 9PM</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">Email</p>
                                <p className="text-sm text-muted-foreground">support@vetridj.com</p>
                                <p className="text-xs text-muted-foreground mt-1">24/7 Response</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">Office</p>
                                <p className="text-sm text-muted-foreground">123 Event Street,<br />Chengam, Tamil Nadu</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card className="glass-dark border-white/5 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" /> Send a Message
                        </CardTitle>
                        <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., Booking Modifications"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue or question..."
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="bg-white/5 border-white/10 resize-none"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" /> Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
