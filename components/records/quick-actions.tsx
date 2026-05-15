"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ClipboardCheck,
  FileText,
  DollarSign,
  Wrench,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Printer,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuickAction {
  id: string
  label: string
  icon: typeof ClipboardCheck
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary"
  disabled?: boolean
  hidden?: boolean
}

interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
  maxVisible?: number
}

export function QuickActions({
  actions,
  className,
  maxVisible = 4,
}: QuickActionsProps) {
  const visibleActions = actions.filter((a) => !a.hidden)
  const primaryActions = visibleActions.slice(0, maxVisible)
  const overflowActions = visibleActions.slice(maxVisible)

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {primaryActions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          <action.icon className="mr-1.5 h-4 w-4" />
          {action.label}
        </Button>
      ))}

      {overflowActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflowActions.map((action, index) => (
              <div key={action.id}>
                {index > 0 && action.variant === "destructive" && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    action.variant === "destructive" && "text-destructive"
                  )}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Pre-built action sets for common record types

export function useCustomerActions(
  customerId: string,
  options?: {
    onNewProposal?: () => void
    onNewInspection?: () => void
    onCall?: () => void
    onEmail?: () => void
    onViewMap?: () => void
    onDelete?: () => void
  }
): QuickAction[] {
  return [
    {
      id: "new-proposal",
      label: "New Proposal",
      icon: DollarSign,
      onClick: options?.onNewProposal || (() => {}),
      variant: "default",
    },
    {
      id: "new-inspection",
      label: "Schedule Inspection",
      icon: ClipboardCheck,
      onClick: options?.onNewInspection || (() => {}),
    },
    {
      id: "call",
      label: "Call",
      icon: Phone,
      onClick: options?.onCall || (() => {}),
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      onClick: options?.onEmail || (() => {}),
    },
    {
      id: "view-map",
      label: "View on Map",
      icon: MapPin,
      onClick: options?.onViewMap || (() => {}),
    },
    {
      id: "delete",
      label: "Delete Customer",
      icon: Trash2,
      onClick: options?.onDelete || (() => {}),
      variant: "destructive",
    },
  ]
}

export function useSiteActions(
  siteId: string,
  options?: {
    onAddTank?: () => void
    onNewInspection?: () => void
    onViewOnMap?: () => void
    onGenerateReport?: () => void
  }
): QuickAction[] {
  return [
    {
      id: "add-tank",
      label: "Add Tank",
      icon: Plus,
      onClick: options?.onAddTank || (() => {}),
      variant: "default",
    },
    {
      id: "new-inspection",
      label: "Schedule Inspection",
      icon: ClipboardCheck,
      onClick: options?.onNewInspection || (() => {}),
    },
    {
      id: "view-map",
      label: "View on Map",
      icon: MapPin,
      onClick: options?.onViewOnMap || (() => {}),
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: FileText,
      onClick: options?.onGenerateReport || (() => {}),
    },
  ]
}

export function useTankActions(
  tankId: string,
  options?: {
    onInspect?: () => void
    onService?: () => void
    onUploadPhotos?: () => void
    onViewHistory?: () => void
    onCreateProposal?: () => void
    onExport?: () => void
  }
): QuickAction[] {
  return [
    {
      id: "inspect",
      label: "Start Inspection",
      icon: ClipboardCheck,
      onClick: options?.onInspect || (() => {}),
      variant: "default",
    },
    {
      id: "service",
      label: "Log Service",
      icon: Wrench,
      onClick: options?.onService || (() => {}),
    },
    {
      id: "upload-photos",
      label: "Upload Photos",
      icon: Camera,
      onClick: options?.onUploadPhotos || (() => {}),
    },
    {
      id: "create-proposal",
      label: "Create Proposal",
      icon: DollarSign,
      onClick: options?.onCreateProposal || (() => {}),
    },
    {
      id: "export",
      label: "Export Data",
      icon: Download,
      onClick: options?.onExport || (() => {}),
    },
  ]
}

export function useProposalActions(
  proposalId: string,
  options?: {
    onEdit?: () => void
    onDuplicate?: () => void
    onPrint?: () => void
    onMarkWon?: () => void
    onMarkLost?: () => void
    onConvertToProject?: () => void
  }
): QuickAction[] {
  return [
    {
      id: "convert-to-project",
      label: "Convert to Project",
      icon: ExternalLink,
      onClick: options?.onConvertToProject || (() => {}),
      variant: "default",
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: Copy,
      onClick: options?.onDuplicate || (() => {}),
    },
    {
      id: "print",
      label: "Print/PDF",
      icon: Printer,
      onClick: options?.onPrint || (() => {}),
    },
  ]
}
