'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarIcon, Users, Building2, Cylinder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { mockCustomers, mockSites, mockTanks } from '@/lib/mock-data'

interface StartInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StartInspectionDialog({ open, onOpenChange }: StartInspectionDialogProps) {
  const router = useRouter()
  
  const [customer, setCustomer] = useState('')
  const [site, setSite] = useState('')
  const [tank, setTank] = useState('')
  const [crew, setCrew] = useState('')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter sites by customer
  const availableSites = customer 
    ? mockSites.filter(s => s.customer === customer)
    : []
  
  // Filter tanks by site
  const availableTanks = site
    ? mockTanks.filter(t => t.site === site)
    : []

  // Mock crews
  const crews = [
    { id: 'CREW-001', name: 'Martinez Crew' },
    { id: 'CREW-002', name: 'Johnson Crew' },
    { id: 'CREW-003', name: 'Williams Crew' },
  ]

  const handleStart = async () => {
    if (!customer || !site || !tank || !crew || !serviceDate) return
    
    setIsSubmitting(true)
    
    // In real app, this would create the inspection via server action
    // For now, simulate with a delay then navigate
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate a new inspection ID
    const newId = `INS-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    
    onOpenChange(false)
    router.push(`/inspections/${newId}?lang=${language}`)
  }

  const handleReset = () => {
    setCustomer('')
    setSite('')
    setTank('')
    setCrew('')
    setServiceDate(new Date().toISOString().split('T')[0])
    setLanguage('en')
  }

  const isValid = customer && site && tank && crew && serviceDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start New Inspection</DialogTitle>
          <DialogDescription>
            Select the customer, site, and tank for this inspection.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Customer */}
          <div className="grid gap-2">
            <Label htmlFor="customer" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Customer
            </Label>
            <Select value={customer} onValueChange={(value) => {
              setCustomer(value)
              setSite('')
              setTank('')
            }}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map(c => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Site */}
          <div className="grid gap-2">
            <Label htmlFor="site" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Site
            </Label>
            <Select 
              value={site} 
              onValueChange={(value) => {
                setSite(value)
                setTank('')
              }}
              disabled={!customer}
            >
              <SelectTrigger id="site">
                <SelectValue placeholder={customer ? "Select site" : "Select customer first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSites.map(s => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.site_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tank */}
          <div className="grid gap-2">
            <Label htmlFor="tank" className="flex items-center gap-2">
              <Cylinder className="h-4 w-4" />
              Tank
            </Label>
            <Select 
              value={tank} 
              onValueChange={setTank}
              disabled={!site}
            >
              <SelectTrigger id="tank">
                <SelectValue placeholder={site ? "Select tank" : "Select site first"} />
              </SelectTrigger>
              <SelectContent>
                {availableTanks.map(t => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.tank_name} ({t.tank_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crew */}
          <div className="grid gap-2">
            <Label htmlFor="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Crew
            </Label>
            <Select value={crew} onValueChange={setCrew}>
              <SelectTrigger id="crew">
                <SelectValue placeholder="Select crew" />
              </SelectTrigger>
              <SelectContent>
                {crews.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Date */}
          <div className="grid gap-2">
            <Label htmlFor="serviceDate" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Service Date
            </Label>
            <Input
              id="serviceDate"
              type="date"
              value={serviceDate}
              onChange={e => setServiceDate(e.target.value)}
            />
          </div>

          {/* Language */}
          <div className="grid gap-2">
            <Label htmlFor="language">Language Preference</Label>
            <Select value={language} onValueChange={(value: 'en' | 'es') => setLanguage(value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Espa&ntilde;ol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleStart} disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Starting...' : 'Start Inspection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
