"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, Image, Upload, Search, Grid3X3, Table2, GalleryHorizontalEnd,
  Calendar, User, Building2, MapPin, Droplets, X, Check, ChevronsUpDown,
  Download, Eye, Trash2, ExternalLink, Filter, ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MOCK_DOCUMENTS, getPhotoDocuments } from "@/lib/mock-document-data"
import type { DocumentType, DocumentViewMode, CunninghamDocument, AttachableDoctype } from "@/types/document"

const DOCUMENT_TYPES: DocumentType[] = [
  'Proposal', 'Report', 'Contract', 'Spec', 'Invoice', 'Photo',
  'Job Sheet', 'Completion Form', 'Customer File', 'Internal Note'
]

const MOCK_CUSTOMERS = [
  { name: 'CUST-001', display: 'City of Springfield' },
  { name: 'CUST-002', display: 'Riverside Water Authority' },
  { name: 'CUST-003', display: 'Oak Park Municipal Water' },
]

const MOCK_SITES = [
  { name: 'SITE-001', display: 'Main Street Elevated' },
  { name: 'SITE-002', display: 'Riverside Standpipe' },
  { name: 'SITE-003', display: 'Oak Street Elevated' },
]

const MOCK_TANKS = [
  { name: 'TANK-001', display: 'Main Street Tower' },
  { name: 'TANK-002', display: 'Riverside Tank 1' },
  { name: 'TANK-003', display: 'Oak Park Tower' },
]

const MOCK_OWNERS = [
  { email: 'john.smith@cunningham.com', name: 'John Smith' },
  { email: 'sarah.jones@cunningham.com', name: 'Sarah Jones' },
  { email: 'mike.davis@cunningham.com', name: 'Mike Davis' },
  { email: 'carlos.mendez@cunningham.com', name: 'Carlos Mendez' },
]

function getDocumentIcon(type: DocumentType) {
  if (type === 'Photo') return Image
  return FileText
}

function getDocumentColor(type: DocumentType): string {
  const colors: Record<DocumentType, string> = {
    Proposal: 'bg-green-100 text-green-800',
    Report: 'bg-blue-100 text-blue-800',
    Contract: 'bg-purple-100 text-purple-800',
    Spec: 'bg-orange-100 text-orange-800',
    Invoice: 'bg-emerald-100 text-emerald-800',
    Photo: 'bg-pink-100 text-pink-800',
    'Job Sheet': 'bg-yellow-100 text-yellow-800',
    'Completion Form': 'bg-cyan-100 text-cyan-800',
    'Customer File': 'bg-gray-100 text-gray-800',
    'Internal Note': 'bg-red-100 text-red-800',
  }
  return colors[type]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<DocumentViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [selectedTank, setSelectedTank] = useState<string>('')
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<CunninghamDocument | null>(null)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [siteOpen, setSiteOpen] = useState(false)
  const [tankOpen, setTankOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)

  const filteredDocuments = useMemo(() => {
    return MOCK_DOCUMENTS.filter(doc => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!doc.file_name.toLowerCase().includes(query) &&
            !doc.description?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Document type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(doc.document_type)) {
        return false
      }

      // Customer filter
      if (selectedCustomer) {
        const hasCustomer = doc.attachments.some(
          att => att.doctype === 'Customer' && att.name === selectedCustomer
        )
        if (!hasCustomer) return false
      }

      // Site filter
      if (selectedSite) {
        const hasSite = doc.attachments.some(
          att => att.doctype === 'Site' && att.name === selectedSite
        )
        if (!hasSite) return false
      }

      // Tank filter
      if (selectedTank) {
        const hasTank = doc.attachments.some(
          att => att.doctype === 'Tank' && att.name === selectedTank
        )
        if (!hasTank) return false
      }

      // Owner filter
      if (selectedOwner && doc.owner !== selectedOwner) {
        return false
      }

      // Date range filter
      if (dateFrom) {
        const docDate = new Date(doc.creation)
        const fromDate = new Date(dateFrom)
        if (docDate < fromDate) return false
      }
      if (dateTo) {
        const docDate = new Date(doc.creation)
        const toDate = new Date(dateTo)
        if (docDate > toDate) return false
      }

      return true
    })
  }, [searchQuery, selectedTypes, selectedCustomer, selectedSite, selectedTank, selectedOwner, dateFrom, dateTo])

  const photoDocuments = useMemo(() => {
    return filteredDocuments.filter(doc => doc.document_type === 'Photo')
  }, [filteredDocuments])

  // Group photos by site -> tank -> date -> service visit
  const groupedPhotos = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, CunninghamDocument[]>>> = {}
    
    photoDocuments.forEach(photo => {
      const siteAtt = photo.attachments.find(a => a.doctype === 'Site')
      const tankAtt = photo.attachments.find(a => a.doctype === 'Tank')
      const siteName = siteAtt?.display_name || 'Unknown Site'
      const tankName = tankAtt?.display_name || 'Unknown Tank'
      const dateKey = photo.taken_date ? format(new Date(photo.taken_date), 'yyyy-MM-dd') : 'Unknown Date'

      if (!groups[siteName]) groups[siteName] = {}
      if (!groups[siteName][tankName]) groups[siteName][tankName] = {}
      if (!groups[siteName][tankName][dateKey]) groups[siteName][tankName][dateKey] = []
      groups[siteName][tankName][dateKey].push(photo)
    })

    return groups
  }, [photoDocuments])

  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedCustomer('')
    setSelectedSite('')
    setSelectedTank('')
    setSelectedOwner('')
    setDateFrom('')
    setDateTo('')
    setSearchQuery('')
  }

  const hasActiveFilters = selectedTypes.length > 0 || selectedCustomer || selectedSite || 
    selectedTank || selectedOwner || dateFrom || dateTo || searchQuery

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Filter Panel */}
      <aside className="w-[280px] shrink-0 border-r bg-muted/30">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h2>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Separator />

            {/* Document Type */}
            <div className="space-y-2">
              <Label>Document Type</Label>
              <div className="space-y-2">
                {DOCUMENT_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type))
                        }
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Customer Combobox */}
            <div className="space-y-2">
              <Label>Customer</Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                    {selectedCustomer 
                      ? MOCK_CUSTOMERS.find(c => c.name === selectedCustomer)?.display 
                      : "All customers"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => { setSelectedCustomer(''); setCustomerOpen(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", !selectedCustomer ? "opacity-100" : "opacity-0")} />
                          All customers
                        </CommandItem>
                        {MOCK_CUSTOMERS.map(customer => (
                          <CommandItem
                            key={customer.name}
                            value={customer.display}
                            onSelect={() => { setSelectedCustomer(customer.name); setCustomerOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCustomer === customer.name ? "opacity-100" : "opacity-0")} />
                            {customer.display}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Site Combobox */}
            <div className="space-y-2">
              <Label>Site</Label>
              <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                    {selectedSite 
                      ? MOCK_SITES.find(s => s.name === selectedSite)?.display 
                      : "All sites"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search sites..." />
                    <CommandList>
                      <CommandEmpty>No site found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => { setSelectedSite(''); setSiteOpen(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", !selectedSite ? "opacity-100" : "opacity-0")} />
                          All sites
                        </CommandItem>
                        {MOCK_SITES.map(site => (
                          <CommandItem
                            key={site.name}
                            value={site.display}
                            onSelect={() => { setSelectedSite(site.name); setSiteOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedSite === site.name ? "opacity-100" : "opacity-0")} />
                            {site.display}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tank Combobox */}
            <div className="space-y-2">
              <Label>Tank</Label>
              <Popover open={tankOpen} onOpenChange={setTankOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                    {selectedTank 
                      ? MOCK_TANKS.find(t => t.name === selectedTank)?.display 
                      : "All tanks"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tanks..." />
                    <CommandList>
                      <CommandEmpty>No tank found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => { setSelectedTank(''); setTankOpen(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", !selectedTank ? "opacity-100" : "opacity-0")} />
                          All tanks
                        </CommandItem>
                        {MOCK_TANKS.map(tank => (
                          <CommandItem
                            key={tank.name}
                            value={tank.display}
                            onSelect={() => { setSelectedTank(tank.name); setTankOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedTank === tank.name ? "opacity-100" : "opacity-0")} />
                            {tank.display}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Owner Combobox */}
            <div className="space-y-2">
              <Label>Owner</Label>
              <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                    {selectedOwner 
                      ? MOCK_OWNERS.find(o => o.email === selectedOwner)?.name 
                      : "All owners"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search owners..." />
                    <CommandList>
                      <CommandEmpty>No owner found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => { setSelectedOwner(''); setOwnerOpen(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", !selectedOwner ? "opacity-100" : "opacity-0")} />
                          All owners
                        </CommandItem>
                        {MOCK_OWNERS.map(owner => (
                          <CommandItem
                            key={owner.email}
                            value={owner.name}
                            onSelect={() => { setSelectedOwner(owner.email); setOwnerOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedOwner === owner.email ? "opacity-100" : "opacity-0")} />
                            {owner.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as DocumentViewMode)}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid3X3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="gallery" aria-label="Gallery view">
                <GalleryHorizontalEnd className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <UploadForm onClose={() => setUploadDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {viewMode === 'grid' && (
              <DocumentGrid documents={filteredDocuments} onPreview={setPreviewDoc} />
            )}
            {viewMode === 'table' && (
              <DocumentTable documents={filteredDocuments} onPreview={setPreviewDoc} />
            )}
            {viewMode === 'gallery' && (
              <PhotoGallery groupedPhotos={groupedPhotos} onPreview={setPreviewDoc} />
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl">
          {previewDoc && <DocumentPreview document={previewDoc} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentGrid({ documents, onPreview }: { documents: CunninghamDocument[], onPreview: (doc: CunninghamDocument) => void }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No documents found</p>
        <Button variant="outline" className="mt-4">
          <Upload className="h-4 w-4 mr-2" />
          Upload your first document
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map(doc => {
        const Icon = getDocumentIcon(doc.document_type)
        return (
          <Card key={doc.name} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPreview(doc)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", getDocumentColor(doc.document_type))}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{doc.file_name}</p>
                  <Badge variant="outline" className="text-xs mt-1">{doc.document_type}</Badge>
                </div>
              </div>
              {doc.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{doc.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-3">
                {doc.attachments.slice(0, 2).map((att, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {att.display_name}
                  </Badge>
                ))}
                {doc.attachments.length > 2 && (
                  <Badge variant="secondary" className="text-xs">+{doc.attachments.length - 2}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>{doc.owner_name}</span>
                <span>{format(new Date(doc.creation), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function DocumentTable({ documents, onPreview }: { documents: CunninghamDocument[], onPreview: (doc: CunninghamDocument) => void }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No documents found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Attached To</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Owner</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Size</th>
            <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.name} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => onPreview(doc)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getDocumentIcon(doc.document_type) === Image ? (
                    <Image className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">{doc.file_name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge className={cn("text-xs", getDocumentColor(doc.document_type))}>{doc.document_type}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {doc.attachments.slice(0, 2).map((att, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{att.display_name}</Badge>
                  ))}
                  {doc.attachments.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{doc.attachments.length - 2}</Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{doc.owner_name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(doc.creation), 'MMM d, yyyy')}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PhotoGallery({ 
  groupedPhotos, 
  onPreview 
}: { 
  groupedPhotos: Record<string, Record<string, Record<string, CunninghamDocument[]>>>,
  onPreview: (doc: CunninghamDocument) => void
}) {
  const hasPhotos = Object.keys(groupedPhotos).length > 0

  if (!hasPhotos) {
    return (
      <div className="text-center py-12">
        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No photos found</p>
        <p className="text-sm text-muted-foreground mt-1">Photos will appear here grouped by site, tank, and date</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedPhotos).map(([siteName, tanks]) => (
        <div key={siteName}>
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4" />
            {siteName}
          </h2>
          <div className="space-y-6 ml-4">
            {Object.entries(tanks).map(([tankName, dates]) => (
              <div key={tankName}>
                <h3 className="font-medium text-sm flex items-center gap-2 mb-3">
                  <Droplets className="h-4 w-4" />
                  {tankName}
                </h3>
                <div className="space-y-4 ml-4">
                  {Object.entries(dates).map(([dateKey, photos]) => (
                    <div key={dateKey}>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateKey}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {photos.map(photo => (
                          <div 
                            key={photo.name} 
                            className="aspect-square rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border"
                            onClick={() => onPreview(photo)}
                          >
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DocumentPreview({ document: doc }: { document: CunninghamDocument }) {
  const Icon = getDocumentIcon(doc.document_type)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg shrink-0", getDocumentColor(doc.document_type))}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold">{doc.file_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{doc.document_type}</Badge>
            <span className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {doc.description && (
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <p className="text-sm mt-1">{doc.description}</p>
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Owner</Label>
          <p className="text-sm mt-1 flex items-center gap-1">
            <User className="h-3 w-3" />
            {doc.owner_name}
          </p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Created</Label>
          <p className="text-sm mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(doc.creation), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      </div>

      {doc.attachments.length > 0 && (
        <div>
          <Label className="text-xs text-muted-foreground">Attached To</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {doc.attachments.map((att, i) => (
              <Badge key={i} variant="outline" className="flex items-center gap-1">
                {att.doctype === 'Customer' && <Building2 className="h-3 w-3" />}
                {att.doctype === 'Site' && <MapPin className="h-3 w-3" />}
                {att.doctype === 'Tank' && <Droplets className="h-3 w-3" />}
                {att.display_name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {doc.document_type === 'Photo' && doc.photo_category && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Photo Category</Label>
              <p className="text-sm mt-1">{doc.photo_category}</p>
            </div>
            {doc.checklist_item && (
              <div>
                <Label className="text-xs text-muted-foreground">Checklist Item</Label>
                <p className="text-sm mt-1">{doc.checklist_item}</p>
              </div>
            )}
            {doc.related_measurement && (
              <div>
                <Label className="text-xs text-muted-foreground">Related Measurement</Label>
                <p className="text-sm mt-1">{doc.related_measurement}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<DocumentType>('Report')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<{ doctype: AttachableDoctype; name: string }[]>([])

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        <Button variant="outline" size="sm" className="mt-4">
          Select Files
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Document Type *</Label>
        <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DocumentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attach To</Label>
        <p className="text-xs text-muted-foreground">Select records to attach this document to</p>
        <div className="grid grid-cols-2 gap-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CUSTOMERS.map(c => (
                <SelectItem key={c.name} value={c.name}>{c.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select site..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_SITES.map(s => (
                <SelectItem key={s.name} value={s.name}>{s.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        File will be renamed: <code className="bg-muted px-1 rounded">[CUST-CODE]-[YYYYMMDD]-[filename].[ext]</code>
      </p>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button>Upload Document</Button>
      </DialogFooter>
    </div>
  )
}
