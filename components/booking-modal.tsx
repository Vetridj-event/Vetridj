'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Music, CheckCircle2, Sparkles, Calendar as CalendarIcon } from 'lucide-react'
import { storage } from "@/lib/storage"
import { EventPackage, Booking } from "@/types"
import { useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useAuth } from "@/context/auth-context"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ledWallEnabled, setLedWallEnabled] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    eventType: '',
    eventDate: '',
    location: '',
    whatsappNumber: '',
    alternatePhone: '',
    djPackage: '',
    ledWallSize: '',
    additionalNotes: ''
  })

  const ledWallSizes = [
    { size: '6 × 8 ft', sqft: 48, price: 4800 },
    { size: '8 × 12 ft', sqft: 96, price: 9600 },
    { size: '10 × 15 ft', sqft: 150, price: 15000 },
    { size: '10 × 20 ft', sqft: 200, price: 20000 },
    { size: 'Custom', sqft: 0, price: 0 }
  ]

  const { user } = useAuth()
  const [djPackages, setDjPackages] = useState<EventPackage[]>([])
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (open) {
      storage.getPackages().then(setDjPackages)
      storage.getBookings().then(setExistingBookings)

      if (user) {
        setFormData(prev => ({
          ...prev,
          clientName: user.name,
          whatsappNumber: user.whatsapp || user.phone || '',
          alternatePhone: user.phone !== user.whatsapp ? user.phone || '' : ''
        }))
      }
    }
  }, [open, user])

  const calculateTotal = () => {
    let total = 0
    const selectedPackage = djPackages.find(pkg => pkg.name === formData.djPackage)
    if (selectedPackage) total += selectedPackage.price

    if (ledWallEnabled && formData.ledWallSize && formData.ledWallSize !== 'Custom') {
      const selectedSize = ledWallSizes.find(size => size.size === formData.ledWallSize)
      if (selectedSize) total += selectedSize.price
    }

    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate costs
    const selectedPackage = djPackages.find(pkg => pkg.name === formData.djPackage)
    const packagePrice = selectedPackage?.price || 0
    const ledWallPrice = ledWallEnabled && formData.ledWallSize !== 'Custom'
      ? ledWallSizes.find(size => size.size === formData.ledWallSize)?.price || 0
      : 0
    const totalAmount = packagePrice + ledWallPrice

    // Create WhatsApp message
    const message = `🎧🔥 NEW DJ EVENT BOOKING ENQUIRY
Vetri DJ Events – Chengam

━━━━━━━━━━━━━━━
👤 CLIENT DETAILS
Name: ${formData.clientName}
📲 WhatsApp: ${formData.whatsappNumber}
☎️ Alternate: ${formData.alternatePhone || 'N/A'}

━━━━━━━━━━━━━━━
🎉 EVENT DETAILS
Event Type: ${formData.eventType}
📅 Event Date: ${formData.eventDate}
📍 Location: ${formData.location}

━━━━━━━━━━━━━━━
🎶 DJ PACKAGE SELECTED
Package: ${formData.djPackage}
💰 Package Price: ₹${packagePrice.toLocaleString()}

━━━━━━━━━━━━━━━
🧱✨ LED WALL ADD-ON
Selected: ${ledWallEnabled ? '☑️ Yes' : '⬜ No'}
Size: ${ledWallEnabled ? formData.ledWallSize : 'N/A'}
💡 LED Wall Cost: ₹${ledWallEnabled ? ledWallPrice.toLocaleString() : '0'}

━━━━━━━━━━━━━━━
💵 TOTAL BOOKING AMOUNT
🔥 ₹${totalAmount.toLocaleString()}

━━━━━━━━━━━━━━━
📝 ADDITIONAL NOTES
${formData.additionalNotes || 'None'}`

    // Save to storage (Admin will see this)
    const newBooking: any = {
      customerName: formData.clientName,
      customerPhone: formData.whatsappNumber,
      eventType: formData.eventType,
      date: formData.eventDate,
      amount: totalAmount,
      status: 'PENDING',
      djPackage: formData.djPackage,
      additionalNotes: formData.additionalNotes,
      customerId: user?.id,
      customerEmail: user?.email
    }
    await storage.addBooking(newBooking)

    // Open WhatsApp with the message (using the admin number)
    const adminWhatsApp = '916381544170' // Admin WhatsApp number
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank')

    // Show success state
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setLedWallEnabled(false)
    setFormData({
      clientName: '',
      eventType: '',
      eventDate: '',
      location: '',
      whatsappNumber: '',
      alternatePhone: '',
      djPackage: '',
      ledWallSize: '',
      additionalNotes: ''
    })
    onOpenChange(false)
  }

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleReset}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in-50">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Booking Submitted!</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-sm">
              {'Your booking request has been sent via WhatsApp. Our team will contact you shortly to confirm your event details.'}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{'We\'ll get back to you within 2 hours'}</span>
            </div>
            <Button onClick={handleReset} className="bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl">Book Your Event</DialogTitle>
          </div>
          <DialogDescription>
            {'Fill in the details below and we\'ll send your booking request via WhatsApp'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
              Client Details
            </h4>

            <div className="space-y-2">
              <Label htmlFor="clientName">Full Name *</Label>
              <Input
                id="clientName"
                placeholder="Enter your full name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
              Event Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })} required>
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Birthday">Birthday Party</SelectItem>
                    <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                    <SelectItem value="School Function">School Function</SelectItem>
                    <SelectItem value="Cultural Program">Cultural Program</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !formData.eventDate && "text-muted-foreground"
                      )}
                    >
                      {formData.eventDate ? (
                        format(new Date(formData.eventDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                      onSelect={(date) => date && setFormData({ ...formData, eventDate: date.toISOString().split('T')[0] })}
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true

                        // Disable booked dates
                        return existingBookings.some(b => {
                          const bookedDate = new Date(b.date)
                          return date.getDate() === bookedDate.getDate() &&
                            date.getMonth() === bookedDate.getMonth() &&
                            date.getFullYear() === bookedDate.getFullYear() &&
                            b.status !== 'CANCELLED'
                        })
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Event Location *</Label>
              <Input
                id="location"
                placeholder="Enter exact venue address"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Package Selection */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span>
              Package Selection
            </h4>

            <div className="space-y-2">
              <Label htmlFor="djPackage">DJ Package *</Label>
              <Select value={formData.djPackage} onValueChange={(value) => setFormData({ ...formData, djPackage: value })} required>
                <SelectTrigger id="djPackage">
                  <SelectValue placeholder="Select DJ package" />
                </SelectTrigger>
                <SelectContent>
                  {djPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.name}>
                      {pkg.name} - ₹{pkg.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LED Wall Add-On */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">4</span>
              Add-Ons
            </h4>

            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-dashed">
              <Checkbox
                id="ledWall"
                checked={ledWallEnabled}
                onCheckedChange={(checked) => {
                  setLedWallEnabled(checked as boolean)
                  if (!checked) setFormData({ ...formData, ledWallSize: '' })
                }}
              />
              <div className="flex-1">
                <Label htmlFor="ledWall" className="font-semibold cursor-pointer">
                  Add LED Wall Display
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {'Hexagonal LED walls • ₹100 per sq.ft'}
                </p>
              </div>
            </div>

            {ledWallEnabled && (
              <div className="space-y-2 pl-4 animate-in slide-in-from-top-2">
                <Label htmlFor="ledWallSize">LED Wall Size *</Label>
                <Select value={formData.ledWallSize} onValueChange={(value) => setFormData({ ...formData, ledWallSize: value })} required>
                  <SelectTrigger id="ledWallSize">
                    <SelectValue placeholder="Select LED wall size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 × 8 ft">6 × 8 ft - ₹4,800</SelectItem>
                    <SelectItem value="8 × 12 ft">8 × 12 ft - ₹9,600</SelectItem>
                    <SelectItem value="10 × 15 ft">10 × 15 ft - ₹15,000</SelectItem>
                    <SelectItem value="10 × 20 ft">10 × 20 ft - ₹20,000</SelectItem>
                    <SelectItem value="Custom">Custom Size (We'll contact you)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any special requirements or requests..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="min-h-20"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold text-lg">
            <Music className="mr-2 h-5 w-5" />
            Submit Booking Request
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {'By submitting, you agree to be contacted via WhatsApp for booking confirmation'}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
