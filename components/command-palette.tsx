"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import {
  Building2, MapPin, Droplets, FileText, Briefcase, ClipboardCheck,
  Plus, Settings, Globe, Search, Users
} from "lucide-react"

// Mock search data
const SEARCH_DATA = {
  customers: [
    { name: "CUST-001", display: "City of Springfield", type: "Municipality" },
    { name: "CUST-002", display: "Riverside Water Authority", type: "Utility" },
    { name: "CUST-003", display: "Oak Park Municipal Water", type: "Municipality" },
    { name: "CUST-004", display: "Greenfield Township", type: "Municipality" },
    { name: "CUST-005", display: "Westbrook Water District", type: "Utility" },
  ],
  sites: [
    { name: "SITE-001", display: "Main Street Elevated", address: "123 Main St, Springfield, IL" },
    { name: "SITE-002", display: "Riverside Standpipe", address: "456 River Rd, Riverside, IL" },
    { name: "SITE-003", display: "Oak Street Elevated", address: "789 Oak St, Oak Park, IL" },
  ],
  tanks: [
    { name: "TANK-001", display: "Main Street Tower", type: "Elevated - Spheroid" },
    { name: "TANK-002", display: "Riverside Tank 1", type: "Ground - Standpipe" },
    { name: "TANK-003", display: "Oak Park Tower", type: "Elevated - Multi-Leg" },
  ],
  proposals: [
    { name: "PROP-2024-015", display: "Riverside Coating Proposal", customer: "Riverside Water Authority", value: 185000 },
    { name: "PROP-2024-018", display: "Springfield Tank Rehab", customer: "City of Springfield", value: 450000 },
  ],
  projects: [
    { name: "PROJ-2024-008", display: "Oak Park Rehab", customer: "Oak Park Municipal Water" },
    { name: "PROJ-2024-010", display: "Riverside Coating", customer: "Riverside Water Authority" },
  ],
  reports: [
    { name: "RPT-2024-001", display: "Springfield Annual Report", customer: "City of Springfield" },
    { name: "RPT-2024-002", display: "Oak Park Inspection Report", customer: "Oak Park Municipal Water" },
  ],
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState<"en" | "es">("en")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    setSearch("")
    command()
  }, [])

  const navigateTo = useCallback((path: string) => {
    runCommand(() => router.push(path))
  }, [router, runCommand])

  const filteredCustomers = SEARCH_DATA.customers.filter(c =>
    c.display.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSites = SEARCH_DATA.sites.filter(s =>
    s.display.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  )

  const filteredTanks = SEARCH_DATA.tanks.filter(t =>
    t.display.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProposals = SEARCH_DATA.proposals.filter(p =>
    p.display.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProjects = SEARCH_DATA.projects.filter(p =>
    p.display.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase())
  )

  const filteredReports = SEARCH_DATA.reports.filter(r =>
    r.display.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.toLowerCase().includes(search.toLowerCase())
  )

  const hasResults = 
    filteredCustomers.length > 0 ||
    filteredSites.length > 0 ||
    filteredTanks.length > 0 ||
    filteredProposals.length > 0 ||
    filteredProjects.length > 0 ||
    filteredReports.length > 0

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search customers, sites, tanks, proposals..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions - always show when no search */}
        {!search && (
          <>
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => navigateTo("/pipeline?new=true")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Proposal
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/inspections?new=true")}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Start Inspection
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/admin")}>
                <Settings className="mr-2 h-4 w-4" />
                Open Admin
              </CommandItem>
              <CommandItem onSelect={() => {
                runCommand(() => {
                  setLanguage(language === "en" ? "es" : "en")
                  // In a real app, this would update a global language context
                })
              }}>
                <Globe className="mr-2 h-4 w-4" />
                Toggle Language
                <Badge variant="outline" className="ml-auto text-xs">
                  {language === "en" ? "EN → ES" : "ES → EN"}
                </Badge>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Customers */}
        {filteredCustomers.length > 0 && (
          <CommandGroup heading="Customers">
            {filteredCustomers.slice(0, 5).map(customer => (
              <CommandItem
                key={customer.name}
                value={`customer-${customer.display}`}
                onSelect={() => navigateTo(`/customers/${customer.name}`)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{customer.display}</span>
                <Badge variant="outline" className="ml-auto text-xs">{customer.type}</Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Sites */}
        {filteredSites.length > 0 && (
          <CommandGroup heading="Sites">
            {filteredSites.slice(0, 5).map(site => (
              <CommandItem
                key={site.name}
                value={`site-${site.display}`}
                onSelect={() => navigateTo(`/sites/${site.name}`)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{site.display}</span>
                  <span className="text-xs text-muted-foreground">{site.address}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Tanks */}
        {filteredTanks.length > 0 && (
          <CommandGroup heading="Tanks">
            {filteredTanks.slice(0, 5).map(tank => (
              <CommandItem
                key={tank.name}
                value={`tank-${tank.display}`}
                onSelect={() => navigateTo(`/sites/SITE-001/tanks/${tank.name}`)}
              >
                <Droplets className="mr-2 h-4 w-4" />
                <span>{tank.display}</span>
                <Badge variant="outline" className="ml-auto text-xs">{tank.type}</Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Proposals */}
        {filteredProposals.length > 0 && (
          <CommandGroup heading="Proposals">
            {filteredProposals.slice(0, 5).map(proposal => (
              <CommandItem
                key={proposal.name}
                value={`proposal-${proposal.display}`}
                onSelect={() => navigateTo(`/proposals/${proposal.name}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{proposal.display}</span>
                  <span className="text-xs text-muted-foreground">{proposal.customer}</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  ${(proposal.value / 1000).toFixed(0)}K
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Projects */}
        {filteredProjects.length > 0 && (
          <CommandGroup heading="Projects">
            {filteredProjects.slice(0, 5).map(project => (
              <CommandItem
                key={project.name}
                value={`project-${project.display}`}
                onSelect={() => navigateTo(`/projects/${project.name}`)}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{project.display}</span>
                  <span className="text-xs text-muted-foreground">{project.customer}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Reports */}
        {filteredReports.length > 0 && (
          <CommandGroup heading="Reports">
            {filteredReports.slice(0, 5).map(report => (
              <CommandItem
                key={report.name}
                value={`report-${report.display}`}
                onSelect={() => navigateTo(`/reports/${report.name}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{report.display}</span>
                  <span className="text-xs text-muted-foreground">{report.customer}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
