'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Globe,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
]

const adminNav = [
  { name: 'Admin', href: '/admin', icon: Settings },
]

function NavItem({ 
  item, 
  isActive, 
  collapsed 
}: { 
  item: typeof navigation[0]
  isActive: boolean
  collapsed: boolean 
}) {
  const Icon = item.icon
  
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-secondary hover:text-secondary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  )
  
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.name}
        </TooltipContent>
      </Tooltip>
    )
  }
  
  return linkContent
}

function SidebarContent({ 
  collapsed, 
  onToggle,
  showToggle = true 
}: { 
  collapsed: boolean
  onToggle?: () => void
  showToggle?: boolean 
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-lg">C</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">Cunningham</span>
            <span className="text-xs text-muted-foreground">Operations Hub</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('flex flex-col gap-1', collapsed ? 'px-2' : 'px-3')}>
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
                collapsed={collapsed}
              />
            )
          })}
          
          <Separator className="my-3" />
          
          {adminNav.map((item) => {
            const isActive = pathname.startsWith(item.href)

            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
                collapsed={collapsed}
              />
            )
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className={cn(
        'border-t border-border p-3 shrink-0',
        collapsed && 'px-2'
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              'flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary transition-colors text-left',
              collapsed && 'justify-center'
            )}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">User Name</p>
                    <p className="text-xs text-muted-foreground truncate">user@cunningham.com</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={collapsed ? 'center' : 'end'} 
            side={collapsed ? 'right' : 'top'}
            className="w-56"
          >
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
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0 relative overflow-visible',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          <SidebarContent 
            collapsed={collapsed} 
            showToggle={false}
          />
          {/* Collapse toggle - positioned outside sidebar content */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-20 -right-3 z-50 w-6 h-6 rounded-full border border-border bg-background shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
              >
                {collapsed ? (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand' : 'Collapse'}
            </TooltipContent>
          </Tooltip>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent 
              collapsed={false} 
              showToggle={false}
            />
          </SheetContent>
        </Sheet>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar (mobile + search) */}
          <header className="sticky top-0 z-40 flex items-center gap-4 h-14 px-4 border-b border-border bg-background lg:px-6">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* Search */}
            <div className="flex-1 flex items-center">
              <Button
                variant="outline"
                className="w-full max-w-sm justify-start gap-2 text-muted-foreground"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-xs text-muted-foreground">
                  <span className="text-xs">Cmd</span>K
                </kbd>
              </Button>
            </div>

            {/* Language toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 shrink-0">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">EN</span>
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
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
