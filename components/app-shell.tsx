'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Map,
  Building2,
  Workflow,
  Wrench,
  ClipboardCheck,
  FileText,
  FolderKanban,
  FileArchive,
  Receipt,
  Settings,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Customers', href: '/customers', icon: Building2 },
  { name: 'Pipeline', href: '/pipeline', icon: Workflow },
  { name: 'Service', href: '/service', icon: Wrench },
  { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Documents', href: '/documents', icon: FileArchive },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Admin', href: '/admin', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex h-14 items-center px-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-foreground hidden sm:inline">
              Cunningham Hub
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                    'hover:bg-secondary hover:text-secondary-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command palette trigger */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">
                Cmd+K
              </kbd>
            </Button>

            {/* Language toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">EN</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span className="font-medium">English</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Espanol</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-muted-foreground">user@cunningham.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
