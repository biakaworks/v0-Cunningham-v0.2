'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Check, 
  ChevronsUpDown, 
  RotateCcw, 
  Home,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

import type { MapFilters, ServiceDueStatus, ProposalMapStatus, LocationConfidence } from '@/types/map'
import { 
  SERVICE_STATUS_OPTIONS, 
  PROPOSAL_STATUS_OPTIONS, 
  LOCATION_CONFIDENCE_OPTIONS 
} from '@/types/map'

interface FilterOptions {
  states: string[]
  regions: string[]
  tankTypes: string[]
  customers: { name: string; label: string }[]
  sites: { name: string; label: string }[]
  years: number[]
}

interface MapFilterPanelProps {
  open: boolean
  filters: MapFilters
  onFiltersChange: (filters: MapFilters) => void
  filterOptions: FilterOptions
  onReset: () => void
  onResetToDefaultView: () => void
}

function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (values: T[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-1">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`${label}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, option.value])
                } else {
                  onChange(selected.filter((v) => v !== option.value))
                }
              }}
            />
            <Label 
              htmlFor={`${label}-${option.value}`} 
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComboboxFilter({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  options: { name: string; label: string }[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value
              ? options.find((opt) => opt.name === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange(null)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.name}
                    onSelect={() => {
                      onChange(option.name)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function StringMultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${label}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, option])
                } else {
                  onChange(selected.filter((v) => v !== option))
                }
              }}
            />
            <Label 
              htmlFor={`${label}-${option}`} 
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MapFilterPanel({
  open,
  filters,
  onFiltersChange,
  filterOptions,
  onReset,
  onResetToDefaultView,
}: MapFilterPanelProps) {
  if (!open) return null
  
  const updateFilter = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-background border-l z-[999] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold text-lg">Filters</h2>
        <p className="text-sm text-muted-foreground">Refine map markers</p>
      </div>
      
      {/* Scrollable filters */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Service Status */}
          <MultiSelectFilter<ServiceDueStatus>
            label="Service Status"
            options={SERVICE_STATUS_OPTIONS}
            selected={filters.service_status}
            onChange={(values) => updateFilter('service_status', values)}
          />
          
          <Separator />
          
          {/* Proposal Status */}
          <MultiSelectFilter<ProposalMapStatus>
            label="Proposal Status"
            options={PROPOSAL_STATUS_OPTIONS}
            selected={filters.proposal_status}
            onChange={(values) => updateFilter('proposal_status', values)}
          />
          
          <Separator />
          
          {/* Customer */}
          <ComboboxFilter
            label="Customer"
            placeholder="All customers"
            options={filterOptions.customers}
            value={filters.customer}
            onChange={(value) => updateFilter('customer', value)}
          />
          
          {/* Site */}
          <ComboboxFilter
            label="Site"
            placeholder="All sites"
            options={filterOptions.sites}
            value={filters.site}
            onChange={(value) => updateFilter('site', value)}
          />
          
          <Separator />
          
          {/* State */}
          <StringMultiSelectFilter
            label="State"
            options={filterOptions.states}
            selected={filters.state}
            onChange={(values) => updateFilter('state', values)}
          />
          
          {/* Region */}
          {filterOptions.regions.length > 0 && (
            <StringMultiSelectFilter
              label="Region"
              options={filterOptions.regions}
              selected={filters.region}
              onChange={(values) => updateFilter('region', values)}
            />
          )}
          
          <Separator />
          
          {/* Tank Type */}
          <StringMultiSelectFilter
            label="Tank Type"
            options={filterOptions.tankTypes}
            selected={filters.tank_type}
            onChange={(values) => updateFilter('tank_type', values)}
          />
          
          {/* Service Year */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Service Year</Label>
            <Select
              value={filters.service_year?.toString() || ''}
              onValueChange={(value) => updateFilter('service_year', value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All years</SelectItem>
                {filterOptions.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          {/* Location Confidence */}
          <MultiSelectFilter<LocationConfidence>
            label="Location Confidence"
            options={LOCATION_CONFIDENCE_OPTIONS}
            selected={filters.location_confidence}
            onChange={(values) => updateFilter('location_confidence', values)}
          />
          
          <Separator />
          
          {/* Phase 2 note */}
          <div className="bg-muted rounded-md p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Route planning — Planned for Phase 2.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer actions */}
      <div className="p-4 border-t space-y-2 shrink-0">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onResetToDefaultView}
        >
          <Home className="mr-2 h-4 w-4" />
          Reset to Default View
        </Button>
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
