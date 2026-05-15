'use client'

import { useState } from 'react'
import { 
  Check, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  ChevronDown 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { SyncState, SyncStatus } from '@/types/inspection'
import { t, type Language } from '@/lib/i18n/inspection-labels'

// =============================================================================
// Sync Status Badge - Per-inspection status indicator
// =============================================================================

interface SyncStatusBadgeProps {
  syncState: SyncState
  lang?: Language
  onRetry?: () => void
  className?: string
}

export function SyncStatusBadge({ 
  syncState, 
  lang = 'en', 
  onRetry,
  className 
}: SyncStatusBadgeProps) {
  const { status, lastSyncedAt, error } = syncState

  const statusConfig: Record<SyncStatus, { 
    icon: React.ReactNode
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className: string
  }> = {
    synced: {
      icon: <Check className="h-3 w-3" />,
      label: t('sync_synced', lang),
      variant: 'outline',
      className: 'border-green-500 text-green-700 bg-green-50',
    },
    queued: {
      icon: <Clock className="h-3 w-3" />,
      label: t('sync_queued', lang),
      variant: 'outline',
      className: 'border-gray-400 text-gray-600 bg-gray-50',
    },
    syncing: {
      icon: <RefreshCw className="h-3 w-3 animate-spin" />,
      label: t('sync_syncing', lang),
      variant: 'outline',
      className: 'border-blue-500 text-blue-700 bg-blue-50',
    },
    failed: {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: t('sync_failed', lang),
      variant: 'destructive',
      className: '',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant={config.variant} 
        className={cn('flex items-center gap-1 text-xs', config.className)}
      >
        {config.icon}
        {config.label}
      </Badge>
      
      {status === 'synced' && lastSyncedAt && (
        <span className="text-xs text-muted-foreground">
          {formatSyncTime(lastSyncedAt)}
        </span>
      )}
      
      {status === 'failed' && onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          {t('retry', lang)}
        </Button>
      )}
      
      {status === 'failed' && error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  )
}

// =============================================================================
// Header Sync Indicator - Persistent status with queue depth
// =============================================================================

interface HeaderSyncIndicatorProps {
  isOnline: boolean
  isSyncing: boolean
  queueDepth: number
  lastSyncedAt: string | null
  items: Array<{ id: string; type: string; lastError?: string }>
  lang?: Language
  onFlush?: () => void
  onRetryItem?: (id: string) => void
}

export function HeaderSyncIndicator({
  isOnline,
  isSyncing,
  queueDepth,
  lastSyncedAt,
  items,
  lang = 'en',
  onFlush,
  onRetryItem,
}: HeaderSyncIndicatorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center gap-2 h-8 px-2',
            !isOnline && 'text-amber-600',
            queueDepth > 0 && isOnline && 'text-blue-600',
            isSyncing && 'animate-pulse'
          )}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          
          {isSyncing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : queueDepth > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {queueDepth}
            </Badge>
          ) : null}
          
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {isOnline ? (
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                <WifiOff className="h-3 w-3 mr-1" />
                No Connection
              </Badge>
            )}
          </div>
          
          {lastSyncedAt && (
            <div className="text-xs text-muted-foreground">
              {t('last_sync', lang)}: {formatSyncTime(lastSyncedAt)}
            </div>
          )}
          
          {queueDepth > 0 && (
            <>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {queueDepth} {t('queued_inspections', lang)}
                  </span>
                  {isOnline && onFlush && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onFlush}
                      disabled={isSyncing}
                      className="h-7"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        'Sync Now'
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                    >
                      <span className="truncate flex-1">{item.id}</span>
                      {item.lastError ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {onRetryItem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRetryItem(item.id)}
                              className="h-5 px-1 text-xs"
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {queueDepth === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              All changes synced
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function formatSyncTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}
