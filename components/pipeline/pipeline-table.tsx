"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Download, Calendar, UserPlus, Search, Filter } from "lucide-react"
import Link from "next/link"
import type { PipelineProposal, TypeFilter } from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"
import { STATUS_COLORS, TYPE_COLORS, PROPOSAL_STATUSES } from "@/types/pipeline"

interface PipelineTableProps {
  proposals: PipelineProposal[]
  typeFilter: TypeFilter
  onBulkAction?: (action: string, proposalIds: string[]) => void
}

type SortKey = "customer_name" | "site_name" | "total" | "status" | "sent_date" | "age_days" | "next_follow_up_date"
type SortDirection = "asc" | "desc"

export function PipelineTable({ proposals, typeFilter, onBulkAction }: PipelineTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>("age_days")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all")
  const [staleOnly, setStaleOnly] = useState(false)

  const filteredAndSorted = useMemo(() => {
    let result = [...proposals]

    // Type filter
    if (typeFilter === "engineered") {
      result = result.filter((p) => p.proposal_type === "Engineered Spec")
    } else if (typeFilter === "negotiated") {
      result = result.filter((p) => p.proposal_type === "Negotiated")
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Stale filter
    if (staleOnly) {
      result = result.filter((p) => p.is_stale)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.customer_name.toLowerCase().includes(query) ||
          p.site_name.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          p.proposal_number.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | null = a[sortKey] ?? ""
      let bVal: string | number | null = b[sortKey] ?? ""

      if (typeof aVal === "string") aVal = aVal.toLowerCase()
      if (typeof bVal === "string") bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [proposals, typeFilter, statusFilter, staleOnly, searchQuery, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredAndSorted.map((p) => p.name)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedIds.size > 0) {
      onBulkAction(action, Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const exportToCSV = () => {
    const selected = filteredAndSorted.filter((p) => selectedIds.has(p.name))
    const data = selected.length > 0 ? selected : filteredAndSorted

    const headers = ["Proposal #", "Customer", "Site", "Title", "Value", "Type", "Status", "Sent Date", "Age (days)", "Next Follow-Up", "Owner"]
    const rows = data.map((p) => [
      p.proposal_number,
      p.customer_name,
      p.site_name,
      p.title,
      p.total || 0,
      p.proposal_type,
      p.status,
      p.sent_date || "",
      p.age_days,
      p.next_follow_up_date || "",
      p.owner_name,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pipeline-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortHeader = ({ column, label }: { column: SortKey; label: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === column &&
          (sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProposalStatus | "all")}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PROPOSAL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={staleOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setStaleOnly(!staleOnly)}
          >
            Stale Only
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("assign")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Owner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("schedule")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Follow-Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredAndSorted.length > 0 &&
                    selectedIds.size === filteredAndSorted.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <SortHeader column="customer_name" label="Customer" />
              <TableHead>Site</TableHead>
              <TableHead>Scope</TableHead>
              <SortHeader column="total" label="Value" />
              <TableHead>Type</TableHead>
              <SortHeader column="status" label="Status" />
              <SortHeader column="sent_date" label="Sent" />
              <SortHeader column="age_days" label="Age" />
              <SortHeader column="next_follow_up_date" label="Follow-Up" />
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                  No proposals found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((proposal) => (
                <TableRow key={proposal.name}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(proposal.name)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(proposal.name, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/proposals/${proposal.name}`}
                      className="font-medium hover:underline"
                    >
                      {proposal.customer_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {proposal.site_name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {proposal.title}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(proposal.total || 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", TYPE_COLORS[proposal.proposal_type])}
                    >
                      {proposal.proposal_type === "Engineered Spec" ? "Eng" : "Neg"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", STATUS_COLORS[proposal.status])}
                      >
                        {proposal.status}
                      </Badge>
                      {proposal.is_stale && (
                        <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-xs text-yellow-700">
                          Stale
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {proposal.sent_date
                      ? new Date(proposal.sent_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {proposal.age_days}d
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {proposal.next_follow_up_date
                      ? new Date(proposal.next_follow_up_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">
                          {proposal.owner_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{proposal.owner_name}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSorted.length} of {proposals.length} proposals
      </div>
    </div>
  )
}
