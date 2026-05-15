"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, MapPin, Building2, Droplets } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface RecordHeaderProps {
  title: string
  subtitle?: string
  status?: string
  statusVariant?: "default" | "secondary" | "destructive" | "outline"
  breadcrumbs?: Breadcrumb[]
  backHref?: string
  icon?: "customer" | "site" | "tank"
  isLoading?: boolean
  children?: React.ReactNode
  className?: string
}

const iconMap = {
  customer: Building2,
  site: MapPin,
  tank: Droplets,
}

export function RecordHeader({
  title,
  subtitle,
  status,
  statusVariant = "default",
  breadcrumbs,
  backHref,
  icon,
  isLoading = false,
  children,
  className,
}: RecordHeaderProps) {
  const Icon = icon ? iconMap[icon] : null

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {breadcrumbs && <Skeleton className="h-4 w-48" />}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="mr-1 h-7 px-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-muted-foreground">/</span>
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {status && (
                <Badge variant={statusVariant} className="text-xs">
                  {status}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions slot */}
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}

// Stats row component for showing key metrics
interface StatItem {
  label: string
  value: string | number
  subValue?: string
  trend?: "up" | "down" | "neutral"
}

export function StatsRow({
  stats,
  className,
}: {
  stats: StatItem[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4 sm:grid-cols-4",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={index} className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {stat.label}
          </p>
          <p className="text-xl font-semibold">{stat.value}</p>
          {stat.subValue && (
            <p className="text-muted-foreground text-xs">{stat.subValue}</p>
          )}
        </div>
      ))}
    </div>
  )
}
