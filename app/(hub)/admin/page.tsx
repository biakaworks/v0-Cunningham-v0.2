"use client"

import { useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Users, Shield, FileText, MapPin, Copy, AlertTriangle, ClipboardCheck,
  Plus, Pencil, Trash2, Check, X, Search, ChevronRight, MoreHorizontal,
  Calendar, User, Eye, EyeOff, Lock, Unlock, Globe, Save
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  MOCK_USERS,
  MOCK_ROLE_PERMISSIONS,
  MOCK_SENSITIVE_FIELD_GATES,
  MOCK_AUDIT_LOG,
  MOCK_TOWER_VERIFICATION,
  MOCK_DUPLICATE_CANDIDATES,
  MOCK_LOW_CONFIDENCE_RECORDS,
  MOCK_CHECKLIST_TEMPLATES,
} from "@/lib/mock-document-data"
import type {
  AdminUser,
  UserRole,
  UserStatus,
  RecordType,
  PermissionLevel,
  SensitiveFieldVisibility,
  AuditLogEntry,
  TowerVerificationItem,
  DuplicateCandidate,
  LowConfidenceRecord,
  ChecklistTemplate,
  BilingualLabel,
} from "@/types/document"

const ALL_ROLES: UserRole[] = [
  'Leadership', 'Sales', 'Estimator', 'Operations', 'Admin',
  'Accounting', 'Field Foreman', 'Service Crew', 'Read-Only'
]

const ALL_RECORD_TYPES: RecordType[] = [
  'Customer', 'Site', 'Tank', 'Opportunity', 'Proposal',
  'Project', 'Report', 'Document', 'Billing', 'Inspection', 'Audit'
]

const SENSITIVE_FIELDS = [
  { key: 'proposal_value', label: 'Proposal Value' },
  { key: 'margin', label: 'Margin' },
  { key: 'invoice_amounts', label: 'Invoice Amounts' },
  { key: 'payroll_related', label: 'Payroll Related' },
  { key: 'job_cost', label: 'Job Cost' },
]

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Manage users, permissions, and system settings</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="tower-verification" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tower Verification
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate Review
          </TabsTrigger>
          <TabsTrigger value="low-confidence" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low-Confidence
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Checklist Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
        <TabsContent value="tower-verification">
          <TowerVerificationTab />
        </TabsContent>
        <TabsContent value="duplicates">
          <DuplicateReviewTab />
        </TabsContent>
        <TabsContent value="low-confidence">
          <LowConfidenceTab />
        </TabsContent>
        <TabsContent value="checklists">
          <ChecklistTemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =============================================================================
// Tab 1: Users
// =============================================================================

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeactivate = (userId: string) => {
    setUsers(users.map(u => 
      u.name === userId ? { ...u, status: 'Deactivated' as UserStatus } : u
    ))
    toast.success('User deactivated')
  }

  const handleActivate = (userId: string) => {
    setUsers(users.map(u => 
      u.name === userId ? { ...u, status: 'Active' as UserStatus } : u
    ))
    toast.success('User activated')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and role assignments</CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <UserForm onClose={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.name}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {user.language_preference === 'en' ? 'English' : 'Spanish'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.status === 'Active' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeactivate(user.name)}>
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleActivate(user.name)}>
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && <UserForm user={editingUser} onClose={() => setEditingUser(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function UserForm({ user, onClose }: { user?: AdminUser; onClose: () => void }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [roles, setRoles] = useState<UserRole[]>(user?.roles || [])
  const [language, setLanguage] = useState<'en' | 'es'>(user?.language_preference || 'en')

  const handleSubmit = () => {
    toast.success(user ? 'User updated' : 'User created')
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_ROLES.map(role => (
            <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={roles.includes(role)}
                onCheckedChange={(checked) => {
                  if (checked) setRoles([...roles, role])
                  else setRoles(roles.filter(r => r !== role))
                }}
              />
              {role}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Language Preference</Label>
        <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'es')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{user ? 'Save Changes' : 'Create User'}</Button>
      </DialogFooter>
    </div>
  )
}

// =============================================================================
// Tab 2: Permissions Matrix
// =============================================================================

function PermissionsTab() {
  const [permissions, setPermissions] = useState(MOCK_ROLE_PERMISSIONS)
  const [sensitiveGates, setSensitiveGates] = useState(MOCK_SENSITIVE_FIELD_GATES)
  const [isPending, startTransition] = useTransition()

  const handlePermissionChange = (role: UserRole, recordType: RecordType, level: PermissionLevel) => {
    setPermissions(permissions.map(rp => 
      rp.role === role 
        ? { ...rp, permissions: { ...rp.permissions, [recordType]: level } }
        : rp
    ))
  }

  const handleSave = () => {
    startTransition(() => {
      toast.success('Permissions saved')
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>Configure role-based access to record types</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] sticky left-0 bg-background">Role</TableHead>
                    {ALL_RECORD_TYPES.map(type => (
                      <TableHead key={type} className="text-center text-xs px-2">{type}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(rp => (
                    <TableRow key={rp.role}>
                      <TableCell className="font-medium sticky left-0 bg-background">{rp.role}</TableCell>
                      {ALL_RECORD_TYPES.map(type => (
                        <TableCell key={type} className="text-center p-1">
                          <Select 
                            value={rp.permissions[type]} 
                            onValueChange={(v) => handlePermissionChange(rp.role, type, v as PermissionLevel)}
                          >
                            <SelectTrigger className="h-8 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Read">Read</SelectItem>
                              <SelectItem value="Write">Write</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sensitive Field Gates</CardTitle>
          <CardDescription>Control visibility of sensitive financial data per role</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] sticky left-0 bg-background">Field</TableHead>
                    {ALL_ROLES.map(role => (
                      <TableHead key={role} className="text-center text-xs px-2">{role}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SENSITIVE_FIELDS.map(field => (
                    <TableRow key={field.key}>
                      <TableCell className="font-medium sticky left-0 bg-background">{field.label}</TableCell>
                      {ALL_ROLES.map(role => (
                        <TableCell key={role} className="text-center p-1">
                          <Select 
                            value={sensitiveGates[field.key as keyof typeof sensitiveGates][role]}
                            onValueChange={(v) => {
                              setSensitiveGates({
                                ...sensitiveGates,
                                [field.key]: {
                                  ...sensitiveGates[field.key as keyof typeof sensitiveGates],
                                  [role]: v
                                }
                              })
                            }}
                          >
                            <SelectTrigger className="h-8 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visible">
                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                              </SelectItem>
                              <SelectItem value="Summary">Summary</SelectItem>
                              <SelectItem value="Hidden">
                                <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Tab 3: Audit Log
// =============================================================================

function AuditLogTab() {
  const [entries] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOG)
  const [userFilter, setUserFilter] = useState('')
  const [recordTypeFilter, setRecordTypeFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filteredEntries = entries.filter(entry => {
    if (userFilter && entry.user !== userFilter) return false
    if (recordTypeFilter && entry.record_type !== recordTypeFilter) return false
    if (actionFilter && entry.action !== actionFilter) return false
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Track important changes across the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {MOCK_USERS.map(user => (
                <SelectItem key={user.name} value={user.name}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All record types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All record types</SelectItem>
              {ALL_RECORD_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="Create">Create</SelectItem>
              <SelectItem value="Update">Update</SelectItem>
              <SelectItem value="Delete">Delete</SelectItem>
              <SelectItem value="Approve">Approve</SelectItem>
              <SelectItem value="Reject">Reject</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry.name}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{entry.user_name}</TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="text-xs mr-2">{entry.record_type}</Badge>
                      <span className="text-sm">{entry.record_display}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      entry.action === 'Create' ? 'default' :
                      entry.action === 'Delete' ? 'destructive' :
                      entry.action === 'Approve' ? 'default' :
                      'secondary'
                    }>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.field_changed && (
                      <span>
                        <span className="text-muted-foreground">{entry.field_changed}:</span>{' '}
                        <span className="line-through text-red-500">{entry.previous_value}</span>{' '}
                        <ChevronRight className="h-3 w-3 inline" />{' '}
                        <span className="text-green-600">{entry.new_value}</span>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Tab 4: Tower Verification Queue
// =============================================================================

function TowerVerificationTab() {
  const [items] = useState<TowerVerificationItem[]>(MOCK_TOWER_VERIFICATION)
  const [editingItem, setEditingItem] = useState<TowerVerificationItem | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tower Verification Queue</CardTitle>
        <CardDescription>Sites with unverified locations that need manual review</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">All tower locations are verified</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.name}>
                    <TableCell>{item.customer_name}</TableCell>
                    <TableCell className="font-medium">{item.site_name}</TableCell>
                    <TableCell className="text-sm">{item.current_address}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.confidence === 'High' ? 'default' :
                        item.confidence === 'Medium' ? 'secondary' :
                        'destructive'
                      }>
                        {item.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.last_updated), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Tower Location</DialogTitle>
          </DialogHeader>
          {editingItem && <TowerVerificationForm item={editingItem} onClose={() => setEditingItem(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function TowerVerificationForm({ item, onClose }: { item: TowerVerificationItem; onClose: () => void }) {
  const [address, setAddress] = useState(item.current_address)
  const [latitude, setLatitude] = useState(item.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(item.longitude?.toString() || '')

  const handleVerify = () => {
    toast.success('Location verified')
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium">{item.site_name}</p>
        <p className="text-xs text-muted-foreground">{item.customer_name}</p>
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g., 39.7817" />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g., -89.6501" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleVerify}>
          <Check className="h-4 w-4 mr-2" />
          Mark as Verified
        </Button>
      </DialogFooter>
    </div>
  )
}

// =============================================================================
// Tab 5: Duplicate Review Queue
// =============================================================================

function DuplicateReviewTab() {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>(MOCK_DUPLICATE_CANDIDATES)

  const handleMerge = (candidateName: string) => {
    setCandidates(candidates.filter(c => c.name !== candidateName))
    toast.success('Records merged successfully')
  }

  const handleIgnore = (candidateName: string) => {
    setCandidates(candidates.filter(c => c.name !== candidateName))
    toast.success('Marked as not duplicate')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplicate Review Queue</CardTitle>
        <CardDescription>Potential duplicate records flagged for review</CardDescription>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Copy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No potential duplicates found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map(candidate => (
              <Card key={candidate.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>{candidate.doctype}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(candidate.similarity_score * 100)}% match
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="font-medium">{candidate.record_a_display}</p>
                          <p className="text-xs text-muted-foreground">{candidate.record_a_name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="font-medium">{candidate.record_b_display}</p>
                          <p className="text-xs text-muted-foreground">{candidate.record_b_name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Match reason: {candidate.match_reason}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleIgnore(candidate.name)}>
                        Keep Separate
                      </Button>
                      <Button size="sm" onClick={() => handleMerge(candidate.name)}>
                        Merge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Tab 6: Low-Confidence Record Review
// =============================================================================

function LowConfidenceTab() {
  const [records, setRecords] = useState<LowConfidenceRecord[]>(MOCK_LOW_CONFIDENCE_RECORDS)

  const handleApprove = (recordName: string) => {
    setRecords(records.filter(r => r.name !== recordName))
    toast.success('Record approved')
  }

  const handleReject = (recordName: string) => {
    setRecords(records.filter(r => r.name !== recordName))
    toast.success('Record rejected')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low-Confidence Record Review</CardTitle>
        <CardDescription>Records flagged for data quality issues</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No low-confidence records to review</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record.name}>
                    <TableCell className="font-medium">{record.record_display}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.doctype}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="destructive" className="text-xs">{record.issue_type}</Badge>
                        {record.details && (
                          <p className="text-xs text-muted-foreground mt-1">{record.details}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{record.source}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(record.flagged_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleApprove(record.name)}>
                          Approve
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleReject(record.name)}>
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Tab 7: Checklist Templates
// =============================================================================

function ChecklistTemplatesTab() {
  const [templates] = useState<ChecklistTemplate[]>(MOCK_CHECKLIST_TEMPLATES)
  const [selectedTankType, setSelectedTankType] = useState<string>(templates[0]?.tank_type || '')

  const currentTemplate = templates.find(t => t.tank_type === selectedTankType)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checklist Templates</CardTitle>
              <CardDescription>Configure inspection checklists per tank type</CardDescription>
            </div>
            <Select value={selectedTankType} onValueChange={setSelectedTankType}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select tank type" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.tank_type} value={t.tank_type}>{t.tank_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {currentTemplate && (
            <div className="space-y-4">
              <h3 className="font-medium">Sections</h3>
              <div className="grid gap-2">
                {currentTemplate.sections.map(section => (
                  <div key={section.section} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={section.enabled} />
                      <div>
                        <p className="font-medium capitalize">{section.section.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {section.required_photos.length} photos, {section.required_measurements.length} measurements
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bilingual Labels</CardTitle>
          <CardDescription>Edit English and Spanish labels for checklist items</CardDescription>
        </CardHeader>
        <CardContent>
          {currentTemplate && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>English</TableHead>
                    <TableHead>Spanish</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTemplate.labels.map(label => (
                    <TableRow key={label.key}>
                      <TableCell className="font-mono text-sm">{label.key}</TableCell>
                      <TableCell>{label.english}</TableCell>
                      <TableCell>{label.spanish}</TableCell>
                      <TableCell>
                        {label.needs_review ? (
                          <Badge variant="destructive" className="text-xs">Needs Review</Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">Approved</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {label.needs_review && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
