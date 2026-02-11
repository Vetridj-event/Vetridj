'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { storage } from '@/lib/storage'
import { EventPackage } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingModal } from '@/components/booking-modal'
import { MusicalNotes } from '@/components/musical-notes'
import { Music, Zap, Users, Phone, MapPin, Clock, Star, Video, Volume2, Sparkles, LayoutDashboard, LogIn, ChevronRight, User as UserIcon } from 'lucide-react'

export default function Page() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [packages, setPackages] = useState<EventPackage[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    storage.getPackages().then(setPackages)
    // Check for return URL actions
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'book' && user) {
      setIsBookingOpen(true)
    }
  }, [user])

  const handleBookNow = () => {
    if (user) {
      setIsBookingOpen(true)
    } else {
      router.push('/login?returnUrl=/?action=book')
    }
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 text-foreground overflow-x-hidden bg-mesh">
      <MusicalNotes />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background/40 backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <img
                src="/images/logo.png"
                alt="Vetri DJ Events Logo"
                className="h-10 w-10 object-contain relative z-10 brightness-110"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-white">Vetri DJ Events</h1>
              <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase opacity-80">Premium Sound & Light</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button
                asChild
                variant="ghost"
                className="text-white hover:text-primary hover:bg-white/5"
              >
                <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'} className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {user.name}
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-background font-bold px-8 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-500 border-none group"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-slide-up">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-gold text-primary border-primary/20 animate-pulse-slow">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="text-xs font-bold tracking-[0.1em] uppercase">Voted #1 DJ Service in Chengam</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                  ELEVATE <br />
                  <span className="text-gradient-gold">YOUR MOMENT</span>
                </h1>
                <p className="text-xl text-white/50 leading-relaxed max-w-lg font-light">
                  Experience the pinnacle of luxury entertainment. We blend cutting-edge audio technology with immersive visual artistry.
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                <Button
                  onClick={handleBookNow}
                  size="xl"
                  className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 text-background font-black rounded-2xl shadow-[0_20px_40px_rgba(212,175,55,0.15)] group relative overflow-hidden transition-all duration-500"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Music className="h-5 w-5" />
                    BOOK NOW
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Button>
                <Button variant="outline" size="xl" asChild className="h-16 px-10 text-lg border-white/10 hover:bg-white/5 backdrop-blur-xl rounded-2xl transition-all duration-500 group">
                  <a href="tel:+916381544170" className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    CALL US
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                {[
                  { label: 'Events Run', value: '500+' },
                  { label: 'Happy Clients', value: '450+' },
                  { label: 'Crew Members', value: '15' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group p-4">
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl">
                <img
                  src="/images/Event.jpg"
                  alt="Premium Event Setup"
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-8 left-8 right-8 p-6 glass backdrop-blur-md rounded-2xl border-white/10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-bold text-xs tracking-widest uppercase mb-1">Latest Event</p>
                      <p className="text-white font-bold">Grand Wedding - Chengam Regency</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">Our Expertise</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">PREMIUM <span className="text-primary font-light italic tracking-tight">SERVICES.</span></h2>
            </div>
            <p className="text-white/40 max-w-md text-right font-light leading-relaxed">
              We provide a comprehensive suite of entertainment solutions tailored for those who demand nothing but the absolute best for their special occasions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'High-End Sound',
                desc: 'Tour-grade JBL sound systems calibrated for perfect acoustics in any venue size.',
                color: 'primary'
              },
              {
                icon: Video,
                title: 'Visual Artistry',
                desc: 'Cinematic LED wall displays and 4K visual mapping that transform spaces into experiences.',
                color: 'secondary'
              },
              {
                icon: Sparkles,
                title: 'Intelligent Light',
                desc: 'Computer-controlled lighting choreography synchronized perfectly to every musical beat.',
                color: 'accent'
              }
            ].map((service, i) => (
              <Card key={i} className="glass-dark border-white/5 hover:border-primary/30 transition-all duration-700 group overflow-hidden">
                <CardContent className="pt-12 p-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                    <service.icon className="w-8 h-8 text-primary group-hover:text-background transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                    <p className="text-white/40 leading-relaxed font-light">{service.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 cursor-pointer">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Gallery */}
      <section className="py-32 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">THE <span className="text-gradient-gold">MAGICAL</span> GALLERY</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[300px]">
            {[
              { src: '/images/Event1.jpg', span: 'md:col-span-2' },
              { src: '/images/Event2.jpg', span: '' },
              { src: '/images/Event3.jpg', span: 'md:row-span-2' },
              { src: '/images/Event4.jpg', span: '' },
              { src: '/images/Event.jpg', span: 'md:col-span-2' },
            ].map((asset, i) => (
              <div key={i} className={`relative group overflow-hidden rounded-[2rem] border border-white/5 ${asset.span}`}>
                <img src={asset.src} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0" alt="Music Event" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full glass flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Packages Table */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24 max-w-2xl mx-auto space-y-6">
            <Badge variant="outline" className="border-primary/50 text-primary uppercase px-6 py-2 rounded-full font-black tracking-widest text-[11px]">Investment</Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">CURATED <span className="text-white/50">PACKAGES</span></h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-end">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`${pkg.isPopular
                  ? 'bg-primary border-none shadow-[0_30px_60px_rgba(212,175,55,0.2)] rounded-[3.5rem] p-6 relative transform scale-105 z-10'
                  : 'glass-dark border-white/5 hover:border-white/20 transition-all duration-500 rounded-[3rem] p-4'
                  } group`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-white text-background px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Most Reserved
                  </div>
                )}
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-2">
                    <h4 className={`text-xl font-bold tracking-tighter ${pkg.isPopular ? 'text-background/60' : 'text-white/60'}`}>
                      {pkg.name.toUpperCase()}
                    </h4>
                    <p className={`font-black tracking-tight ${pkg.isPopular ? 'text-6xl text-background leading-none' : 'text-4xl text-white'}`}>
                      ₹{pkg.price.toLocaleString()}
                    </p>
                  </div>
                  <ul className="space-y-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-4 text-sm font-light ${pkg.isPopular ? 'text-background font-bold' : 'text-white/50'}`}>
                        {pkg.isPopular ? (
                          <Star className="w-4 h-4 fill-background" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center">
                            <Music className="w-2 h-2 text-primary" />
                          </div>
                        )}
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={handleBookNow}
                    size={pkg.isPopular ? "xl" : "lg"}
                    className={`w-full h-14 rounded-2xl transition-all duration-500 ${pkg.isPopular
                      ? 'h-16 rounded-3xl bg-background text-primary hover:bg-background/90 font-black shadow-xl'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                  >
                    Select {pkg.name.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-20">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" className="h-12 w-12" alt="Logo" />
                <span className="text-2xl font-black tracking-tighter">VETRI <span className="text-primary italic">DJ EVENTS</span></span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed font-light">
                Chengam's premier entertainment collective. We transform venues into legendary experiences through sound, light, and passion.
              </p>
              <div className="flex gap-4">
                {[Music, Video, Users].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl glass flex items-center justify-center hover:bg-primary hover:text-background transition-all cursor-pointer">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h5 className="text-xs font-black uppercase tracking-widest text-primary">Inquiries</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-white/50 font-light group cursor-pointer">
                  <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-white transition-colors">+91 63815 44170</span>
                </li>
                <li className="flex items-start gap-4 text-white/50 font-light group cursor-pointer">
                  <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-white transition-colors">Toll Gate, Mani Road,<br />Chengam, Tamil Nadu</span>
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <h5 className="text-xs font-black uppercase tracking-widest text-primary">Quick Links</h5>
              <ul className="space-y-4 text-sm text-white/40 font-light">
                {['Home', 'Services', 'Gallery', 'Pricing', 'Login'].map((link, i) => (
                  <li key={i} className="hover:text-primary transition-colors cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">© 2026 Vetri DJ Events. Crafting Excellence.</p>
            <div className="flex gap-10 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>

      <BookingModal open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </div>
  )
}
