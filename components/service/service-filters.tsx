'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Filter, 
  RotateCcw,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import type { ServiceFilters, ServiceDueListStatus } from '@/types/service'
import { SERVICE_STATUS_OPTIONS, DEFAULT_SERVICE_FILTERS } from '@/types/service'

interface FilterOptions {
  states: string[]
  regions: string[]
  customers: { name: string; label: string }[]
  sites: { name: string; label: string }[]
  crews: { name: string; label: string }[]
  years: number[]
}

interface ServiceFiltersBarProps {
  filters: ServiceFilters
  onFiltersChange: (filters: ServiceFilters) => void
  filterOptions: FilterOptions
  onReset: () => void
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
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-9"
          >
            <span className="truncate">
              {value
                ? options.find((opt) => opt.name === value)?.label
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search...`} />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
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
                    <span className="truncate">{option.label}</span>
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

export function ServiceFiltersBar({
  filters,
  onFiltersChange,
  filterOptions,
  onReset,
}: ServiceFiltersBarProps) {
  const updateFilter = <K extends keyof ServiceFilters>(key: K, value: ServiceFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  const activeFilterCount = [
    filters.year !== DEFAULT_SERVICE_FILTERS.year,
    filters.state.length > 0,
    filters.region.length > 0,
    filters.customer !== null,
    filters.site !== null,
    filters.crew !== null,
    filters.status.length !== DEFAULT_SERVICE_FILTERS.status.length,
  ].filter(Boolean).length

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
      {/* Year */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Year</Label>
        <Select
          value={filters.year?.toString() || ''}
          onValueChange={(value) => updateFilter('year', value ? parseInt(value) : null)}
        >
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder="All" />
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
      
      {/* State */}
      <Popover>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">State</Label>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 justify-between min-w-[100px]">
              {filters.state.length > 0 ? `${filters.state.length} selected` : 'All'}
              <Filter className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-3" align="start">
          <div className="space-y-2">
            {filterOptions.states.map((state) => (
              <div key={state} className="flex items-center gap-2">
                <Checkbox
                  id={`state-${state}`}
                  checked={filters.state.includes(state)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('state', [...filters.state, state])
                    } else {
                      updateFilter('state', filters.state.filter(s => s !== state))
                    }
                  }}
                />
                <Label htmlFor={`state-${state}`} className="text-sm font-normal cursor-pointer">
                  {state}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Customer */}
      <ComboboxFilter
        label="Customer"
        placeholder="All"
        options={filterOptions.customers}
        value={filters.customer}
        onChange={(value) => updateFilter('customer', value)}
      />
      
      {/* Crew */}
      <ComboboxFilter
        label="Crew"
        placeholder="All"
        options={filterOptions.crews}
        value={filters.crew}
        onChange={(value) => updateFilter('crew', value)}
      />
      
      {/* Status */}
      <Popover>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 justify-between min-w-[120px]">
              {filters.status.length === 0 
                ? 'All' 
                : filters.status.length === SERVICE_STATUS_OPTIONS.length 
                ? 'All'
                : `${filters.status.length} selected`}
              <Filter className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-3" align="start">
          <div className="space-y-2">
            {SERVICE_STATUS_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('status', [...filters.status, option.value])
                    } else {
                      updateFilter('status', filters.status.filter(s => s !== option.value))
                    }
                  }}
                />
                <Label htmlFor={`status-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Reset */}
      <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
        {activeFilterCount > 0 && (
          <span className="ml-1 text-xs bg-mwi-navy text-white rounded-full px-1.5">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}
