'use client'

import { useState, useEffect, useCallback } from 'react'
import { get, set, del, keys } from 'idb-keyval'
import type { Inspection, SyncStatus, SyncState } from '@/types/inspection'

// =============================================================================
// Offline Sync Hook - IndexedDB + Background Sync
// =============================================================================

const INSPECTION_PREFIX = 'inspection:'
const QUEUE_KEY = 'sync-queue'
const LAST_SYNC_KEY = 'last-sync-timestamp'

interface QueuedItem {
  id: string
  type: 'inspection' | 'photo'
  action: 'create' | 'update' | 'submit'
  data: unknown
  queuedAt: string
  retryCount: number
  lastError?: string
}

interface SyncQueueState {
  items: QueuedItem[]
  isOnline: boolean
  isSyncing: boolean
  lastSyncedAt: string | null
  queueDepth: number
}

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncQueueState>({
    items: [],
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    queueDepth: 0,
  })

  // Load queue from IndexedDB on mount
  useEffect(() => {
    async function loadQueue() {
      try {
        const queue = await get<QueuedItem[]>(QUEUE_KEY) || []
        const lastSync = await get<string>(LAST_SYNC_KEY)
        
        setSyncState(prev => ({
          ...prev,
          items: queue,
          queueDepth: queue.length,
          lastSyncedAt: lastSync || null,
        }))
      } catch (error) {
        console.error('[v0] Failed to load sync queue:', error)
      }
    }
    
    loadQueue()
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    function handleOnline() {
      setSyncState(prev => ({ ...prev, isOnline: true }))
      // Trigger sync when back online
      flushQueue()
    }

    function handleOffline() {
      setSyncState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Add item to sync queue
  const addToQueue = useCallback(async (
    type: QueuedItem['type'],
    action: QueuedItem['action'],
    id: string,
    data: unknown
  ) => {
    const item: QueuedItem = {
      id,
      type,
      action,
      data,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    }

    const currentQueue = await get<QueuedItem[]>(QUEUE_KEY) || []
    
    // Replace existing item for same id/action or add new
    const existingIndex = currentQueue.findIndex(
      q => q.id === id && q.type === type && q.action === action
    )
    
    if (existingIndex >= 0) {
      currentQueue[existingIndex] = item
    } else {
      currentQueue.push(item)
    }

    await set(QUEUE_KEY, currentQueue)
    
    setSyncState(prev => ({
      ...prev,
      items: currentQueue,
      queueDepth: currentQueue.length,
    }))

    // If online, try to sync immediately
    if (navigator.onLine) {
      flushQueue()
    }

    return item
  }, [])

  // Flush the queue (sync all items)
  const flushQueue = useCallback(async () => {
    if (syncState.isSyncing || !navigator.onLine) return

    setSyncState(prev => ({ ...prev, isSyncing: true }))

    try {
      const queue = await get<QueuedItem[]>(QUEUE_KEY) || []
      const results: { item: QueuedItem; success: boolean; error?: string }[] = []

      for (const item of queue) {
        try {
          // In real implementation, call Frappe API here
          await syncItem(item)
          results.push({ item, success: true })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.push({ item, success: false, error: errorMessage })
        }
      }

      // Remove successful items, update retry count for failures
      const remainingQueue = results
        .filter(r => !r.success)
        .map(r => ({
          ...r.item,
          retryCount: r.item.retryCount + 1,
          lastError: r.error,
        }))

      await set(QUEUE_KEY, remainingQueue)
      await set(LAST_SYNC_KEY, new Date().toISOString())

      setSyncState(prev => ({
        ...prev,
        items: remainingQueue,
        queueDepth: remainingQueue.length,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      }))

      return results
    } catch (error) {
      console.error('[v0] Queue flush failed:', error)
      setSyncState(prev => ({ ...prev, isSyncing: false }))
      throw error
    }
  }, [syncState.isSyncing])

  // Retry a specific failed item
  const retryItem = useCallback(async (itemId: string) => {
    const queue = await get<QueuedItem[]>(QUEUE_KEY) || []
    const item = queue.find(q => q.id === itemId)
    
    if (!item) return

    try {
      await syncItem(item)
      
      // Remove from queue on success
      const newQueue = queue.filter(q => q.id !== itemId)
      await set(QUEUE_KEY, newQueue)
      
      setSyncState(prev => ({
        ...prev,
        items: newQueue,
        queueDepth: newQueue.length,
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update retry count
      const newQueue = queue.map(q => 
        q.id === itemId 
          ? { ...q, retryCount: q.retryCount + 1, lastError: errorMessage }
          : q
      )
      await set(QUEUE_KEY, newQueue)
      
      setSyncState(prev => ({
        ...prev,
        items: newQueue,
      }))
      
      return { success: false, error: errorMessage }
    }
  }, [])

  // Get sync state for a specific inspection
  const getInspectionSyncState = useCallback((inspectionId: string): SyncState => {
    const queueItem = syncState.items.find(
      i => i.id === inspectionId && i.type === 'inspection'
    )

    if (!queueItem) {
      return {
        status: 'synced',
        lastSyncedAt: syncState.lastSyncedAt || undefined,
      }
    }

    if (syncState.isSyncing) {
      return { status: 'syncing' }
    }

    if (queueItem.lastError) {
      return {
        status: 'failed',
        error: queueItem.lastError,
        retryCount: queueItem.retryCount,
      }
    }

    return { status: 'queued' }
  }, [syncState])

  return {
    ...syncState,
    addToQueue,
    flushQueue,
    retryItem,
    getInspectionSyncState,
  }
}

// Sync a single item to the server
async function syncItem(item: QueuedItem): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // In real implementation, this would call the Frappe API
  // For now, simulate success
  console.log('[v0] Syncing item:', item.id, item.action)
  
  // Simulate occasional failures for testing
  if (Math.random() < 0.1) {
    throw new Error('Network error - please try again')
  }
}

// =============================================================================
// Local Storage for Inspection Drafts
// =============================================================================

export function useInspectionStorage() {
  // Save inspection draft to IndexedDB
  const saveDraft = useCallback(async (inspection: Inspection) => {
    const key = `${INSPECTION_PREFIX}${inspection.name}`
    await set(key, {
      ...inspection,
      modifiedAt: new Date().toISOString(),
    })
  }, [])

  // Load inspection draft from IndexedDB
  const loadDraft = useCallback(async (inspectionId: string): Promise<Inspection | null> => {
    const key = `${INSPECTION_PREFIX}${inspectionId}`
    const draft = await get<Inspection>(key)
    return draft || null
  }, [])

  // Delete inspection draft
  const deleteDraft = useCallback(async (inspectionId: string) => {
    const key = `${INSPECTION_PREFIX}${inspectionId}`
    await del(key)
  }, [])

  // List all local drafts
  const listDrafts = useCallback(async (): Promise<string[]> => {
    const allKeys = await keys()
    return allKeys
      .filter(k => typeof k === 'string' && k.startsWith(INSPECTION_PREFIX))
      .map(k => (k as string).replace(INSPECTION_PREFIX, ''))
  }, [])

  return {
    saveDraft,
    loadDraft,
    deleteDraft,
    listDrafts,
  }
}
