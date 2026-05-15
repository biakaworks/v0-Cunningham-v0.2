"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
}

export interface RowAction<T> {
  label: string
  onClick: (row: T) => void
  variant?: "default" | "destructive"
}

interface DataTableProps<T extends { name?: string; id?: string }> {
  title?: string
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  rowActions?: RowAction<T>[]
  emptyMessage?: string
  pageSize?: number
  className?: string
}

export function DataTable<T extends { name?: string; id?: string }>({
  title,
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  rowActions,
  emptyMessage = "No records found",
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)

  // Filter data based on search
  const filteredData = data.filter((row) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    )
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = (a as Record<string, unknown>)[sortKey]
    const bVal = (b as Record<string, unknown>)[sortKey]
    const comparison = String(aVal).localeCompare(String(bVal))
    return sortDir === "asc" ? comparison : -comparison
  })

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const getValue = (row: T, key: string): unknown => {
    const keys = key.split(".")
    let value: unknown = row
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return value
  }

  const content = (
    <>
      {searchable && (
        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              {columns.map((_, j) => (
                <Skeleton key={j} className="h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      className={cn(column.headerClassName)}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-medium"
                          onClick={() => handleSort(String(column.key))}
                        >
                          {column.header}
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
                  {rowActions && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row.name || row.id || index}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => {
                      const value = getValue(row, String(column.key))
                      return (
                        <TableCell
                          key={String(column.key)}
                          className={cn(column.className)}
                        >
                          {column.render
                            ? column.render(value, row)
                            : String(value ?? "-")}
                        </TableCell>
                      )
                    })}
                    {rowActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  action.variant === "destructive" &&
                                    "text-destructive"
                                )}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-muted-foreground text-sm">
                Showing {page * pageSize + 1} to{" "}
                {Math.min((page + 1) * pageSize, sortedData.length)} of{" "}
                {sortedData.length} results
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground px-2 text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}

// Common cell renderers

export function StatusBadge({
  status,
  variant,
}: {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    inactive: "secondary",
    pending: "outline",
    won: "default",
    lost: "destructive",
    draft: "secondary",
    submitted: "outline",
    good: "default",
    fair: "secondary",
    poor: "destructive",
  }

  return (
    <Badge variant={variant || variantMap[status.toLowerCase()] || "outline"}>
      {status}
    </Badge>
  )
}

export function CurrencyCell({ value }: { value: number }) {
  return (
    <span className="font-medium">
      {value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </span>
  )
}

export function DateCell({ value }: { value: string }) {
  if (!value) return <span className="text-muted-foreground">-</span>
  return (
    <span>
      {new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </span>
  )
}
