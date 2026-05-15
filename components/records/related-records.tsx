"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronRight, MapPin, Droplets, FileText, DollarSign, ClipboardCheck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface RelatedRecord {
  id: string
  title: string
  subtitle?: string
  status?: string
  statusVariant?: "default" | "secondary" | "destructive" | "outline"
  href: string
  metadata?: { label: string; value: string }[]
}

interface RelatedRecordsCardProps {
  title: string
  icon?: "site" | "tank" | "proposal" | "inspection" | "report"
  records: RelatedRecord[]
  isLoading?: boolean
  onAdd?: () => void
  addLabel?: string
  emptyMessage?: string
  maxHeight?: number
  showViewAll?: boolean
  viewAllHref?: string
  className?: string
}

const iconMap = {
  site: MapPin,
  tank: Droplets,
  proposal: DollarSign,
  inspection: ClipboardCheck,
  report: FileText,
}

export function RelatedRecordsCard({
  title,
  icon,
  records,
  isLoading = false,
  onAdd,
  addLabel = "Add",
  emptyMessage = "No records found",
  maxHeight = 300,
  showViewAll = false,
  viewAllHref,
  className,
}: RelatedRecordsCardProps) {
  const Icon = icon ? iconMap[icon] : null

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <Badge variant="secondary" className="ml-1 text-xs">
            {records.length}
          </Badge>
        </div>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="mr-1 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4 pt-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-1 p-2 pt-0">
              {records.map((record) => (
                <Link
                  key={record.id}
                  href={record.href}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {record.title}
                      </p>
                      {record.status && (
                        <Badge
                          variant={record.statusVariant || "outline"}
                          className="shrink-0 text-xs"
                        >
                          {record.status}
                        </Badge>
                      )}
                    </div>
                    {record.subtitle && (
                      <p className="text-muted-foreground truncate text-xs">
                        {record.subtitle}
                      </p>
                    )}
                    {record.metadata && record.metadata.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {record.metadata.map((meta, i) => (
                          <span
                            key={i}
                            className="text-muted-foreground text-xs"
                          >
                            {meta.label}: <span className="text-foreground">{meta.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
        {showViewAll && viewAllHref && records.length > 0 && (
          <div className="border-t p-2">
            <Link href={viewAllHref}>
              <Button variant="ghost" size="sm" className="w-full">
                View All {title}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Simple list variant for inline display
export function RelatedRecordsList({
  records,
  icon,
  className,
}: {
  records: RelatedRecord[]
  icon?: "site" | "tank" | "proposal" | "inspection" | "report"
  className?: string
}) {
  const Icon = icon ? iconMap[icon] : null

  return (
    <div className={cn("space-y-1", className)}>
      {records.map((record) => (
        <Link
          key={record.id}
          href={record.href}
          className="hover:bg-muted/50 flex items-center gap-2 rounded-md p-2 transition-colors"
        >
          {Icon && <Icon className="text-muted-foreground h-4 w-4 shrink-0" />}
          <span className="truncate text-sm">{record.title}</span>
          {record.status && (
            <Badge variant={record.statusVariant || "outline"} className="ml-auto text-xs">
              {record.status}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  )
}
