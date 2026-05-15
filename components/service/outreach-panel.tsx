'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Send,
  Users,
} from 'lucide-react'

import { MOCK_OUTREACH_TEMPLATES, type OutreachTemplate } from '@/types/service'
import { sendOutreachBatch } from '@/lib/actions/service-visits'

interface OutreachPanelProps {
  selectedCustomerIds: string[]
  selectedCustomerNames: string[]
  onClearSelection: () => void
}

export function OutreachPanel({ 
  selectedCustomerIds, 
  selectedCustomerNames,
  onClearSelection 
}: OutreachPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const handleTemplateChange = (templateId: string) => {
    const template = MOCK_OUTREACH_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setCustomMessage(template.body)
    }
  }
  
  const handleSendOutreach = () => {
    if (!selectedTemplate || selectedCustomerIds.length === 0) return
    
    startTransition(async () => {
      const result = await sendOutreachBatch(selectedCustomerIds, selectedTemplate.id)
      if (result.success) {
        toast.success('Outreach Sent', {
          description: `Sent ${selectedCustomerIds.length} outreach emails`,
        })
        setDialogOpen(false)
        onClearSelection()
      } else {
        toast.error('Error', {
          description: result.error || 'Failed to send outreach',
        })
      }
    })
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-mwi-water-blue" />
              <div>
                <h3 className="font-semibold">Outreach</h3>
                <p className="text-sm text-muted-foreground">
                  Send service reminders to customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCustomerIds.length > 0 && (
                <Badge variant="secondary" className="bg-mwi-navy text-white">
                  {selectedCustomerIds.length} selected
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t">
            {selectedCustomerIds.length === 0 ? (
              <div className="flex items-center gap-3 text-muted-foreground py-4">
                <Users className="h-5 w-5" />
                <p className="text-sm">
                  Select customers from the table below to send outreach.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedCustomerNames.slice(0, 5).map((name, i) => (
                    <Badge key={i} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                  {selectedCustomerNames.length > 5 && (
                    <Badge variant="outline">
                      +{selectedCustomerNames.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setDialogOpen(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Outreach
                  </Button>
                  <Button variant="outline" onClick={onClearSelection}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Send Outreach Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Outreach</DialogTitle>
            <DialogDescription>
              Send service reminders to {selectedCustomerIds.length} customer{selectedCustomerIds.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OUTREACH_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTemplate && (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <p className="text-sm p-2 bg-muted rounded-md">
                    {selectedTemplate.subject}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables like {'{contact_name}'}, {'{tank_name}'}, and {'{due_date}'} will be replaced automatically.
                  </p>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendOutreach} 
              disabled={!selectedTemplate || isPending}
            >
              {isPending ? 'Sending...' : 'Send Outreach'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
