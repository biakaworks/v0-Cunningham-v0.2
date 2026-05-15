"use client"

import { useState, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Package,
  Truck,
  ClipboardList,
  AlertTriangle,
  Camera,
  Plus,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

import { getProjectById } from "@/lib/mock-project-data"
import { getProjectLabel, type Language } from "@/lib/i18n/project-labels"
import { MATERIAL_STATUS_COLORS, PROJECT_STATUS_COLORS } from "@/types/project"

export default function FieldCrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const project = getProjectById(id)
  
  const [lang, setLang] = useState<Language>("en")
  const [addLogOpen, setAddLogOpen] = useState(false)
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  
  const t = (key: Parameters<typeof getProjectLabel>[0]) => getProjectLabel(key, lang)
  
  if (!project) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {lang === "en" ? "Project not found" : "Proyecto no encontrado"}
          </h2>
          <Button asChild className="mt-4">
            <Link href="/projects">
              {lang === "en" ? "Back to Projects" : "Volver a Proyectos"}
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
      month: "short",
      day: "numeric",
    })
  }
  
  // Calculate open tasks (setup items not complete)
  const openTasks = project.setup_checklist.filter(
    i => i.status !== "Complete" && i.status !== "Waived"
  )
  
  // Materials with delivery dates
  const upcomingMaterials = project.materials.filter(
    m => m.status !== "Delivered" && m.expected_delivery
  ).sort((a, b) => (a.expected_delivery || "").localeCompare(b.expected_delivery || ""))
  
  const openExceptionDialog = (materialId: string) => {
    setSelectedMaterialId(materialId)
    setExceptionDialogOpen(true)
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/projects/${project.name}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">{project.project_name}</h1>
              <p className="text-sm text-muted-foreground">{project.project_number}</p>
            </div>
          </div>
          
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "ES" : "EN"}
          </Button>
        </div>
        
        {/* Quick Info */}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {project.site_name}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {project.owner_name || (lang === "en" ? "Unassigned" : "Sin asignar")}
          </div>
          <Badge className={PROJECT_STATUS_COLORS[project.status]}>
            {project.status}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-2">
          <Progress value={project.percent_complete} className="h-2 flex-1" />
          <span className="text-sm font-medium">{project.percent_complete}%</span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {/* Schedule Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                {t("overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("startDate")}</p>
                  <p className="font-medium">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("projectedEnd")}</p>
                  <p className="font-medium">{formatDate(project.projected_end_date)}</p>
                </div>
              </div>
              
              {project.tank_name && (
                <div className="mt-3">
                  <p className="text-muted-foreground text-sm">{t("tank")}</p>
                  <p className="font-medium">{project.tank_name}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Open Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                {lang === "en" ? "Open Tasks" : "Tareas Abiertas"}
              </CardTitle>
              <Badge variant="secondary">{openTasks.length}</Badge>
            </CardHeader>
            <CardContent>
              {openTasks.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {lang === "en" ? "All tasks complete" : "Todas las tareas completadas"}
                </div>
              ) : (
                <div className="space-y-2">
                  {openTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          onCheckedChange={() => toast.success(lang === "en" ? "Task completed" : "Tarea completada")}
                        />
                        <span className="text-sm">{task.name}</span>
                      </div>
                      {task.due_date && (
                        <Badge variant="outline" className="text-xs">
                          {formatDate(task.due_date)}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {openTasks.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      +{openTasks.length - 5} {lang === "en" ? "more" : "más"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                {t("materials")}
              </CardTitle>
              <CardDescription>
                {lang === "en" ? "Expected deliveries" : "Entregas esperadas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.materials.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "No materials ordered" : "No hay materiales pedidos"}
                </p>
              ) : (
                <div className="space-y-3">
                  {project.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{material.item}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.vendor} • {material.quantity} {material.unit}
                        </p>
                        {material.expected_delivery && (
                          <div className="mt-1 flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {lang === "en" ? "Expected" : "Esperado"}: {formatDate(material.expected_delivery)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-xs ${MATERIAL_STATUS_COLORS[material.status]}`}>
                          {material.status}
                        </Badge>
                        {material.status !== "Delivered" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-amber-600"
                            onClick={() => openExceptionDialog(material.id)}
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {t("flagException")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Equipment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                {t("equipment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.equipment.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "No equipment assigned" : "No hay equipo asignado"}
                </p>
              ) : (
                <div className="space-y-2">
                  {project.equipment.map((equip) => (
                    <div
                      key={equip.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{equip.item}</p>
                        <p className="text-xs text-muted-foreground">{equip.vendor}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {equip.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Daily Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                {t("dailyLogs")}
              </CardTitle>
              <Dialog open={addLogOpen} onOpenChange={setAddLogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    {t("addDailyLog")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("addDailyLog")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t("date")}</Label>
                        <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("weather")}</Label>
                        <Input placeholder={lang === "en" ? "Conditions" : "Condiciones"} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("workCompleted")}</Label>
                      <Textarea 
                        placeholder={lang === "en" ? "Describe work completed today..." : "Describe el trabajo completado hoy..."} 
                        rows={3} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("issues")}</Label>
                      <Textarea 
                        placeholder={lang === "en" ? "Any issues or delays..." : "Cualquier problema o retraso..."} 
                        rows={2} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("nextSteps")}</Label>
                      <Textarea 
                        placeholder={lang === "en" ? "Planned work for tomorrow..." : "Trabajo planificado para mañana..."} 
                        rows={2} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("photos")}</Label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
                        <Button variant="outline">
                          <Camera className="mr-2 h-4 w-4" />
                          {lang === "en" ? "Add Photos" : "Agregar Fotos"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddLogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={() => {
                      toast.success(lang === "en" ? "Daily log saved" : "Registro diario guardado")
                      setAddLogOpen(false)
                    }}>
                      {t("save")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {project.daily_logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "No logs yet" : "Sin registros aún"}
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {project.daily_logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{formatDate(log.date)}</span>
                            <Badge variant="outline" className="text-xs">{log.crew}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{log.weather}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {log.work_completed}
                        </p>
                        {log.photos && log.photos.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Camera className="h-3 w-3" />
                            {log.photos.length} {lang === "en" ? "photos" : "fotos"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Flag Exception Dialog */}
      <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("flagException")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("issueType")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={lang === "en" ? "Select issue type" : "Seleccionar tipo de problema"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late">{t("late")}</SelectItem>
                  <SelectItem value="Missing">{t("missing")}</SelectItem>
                  <SelectItem value="Damaged">{t("damaged")}</SelectItem>
                  <SelectItem value="Short">{t("short")}</SelectItem>
                  <SelectItem value="Overage">{t("overage")}</SelectItem>
                  <SelectItem value="Wrong Item">{t("wrongItem")}</SelectItem>
                  <SelectItem value="Changed">{t("changed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{lang === "en" ? "Notes" : "Notas"}</Label>
              <Textarea placeholder={lang === "en" ? "Describe the issue..." : "Describe el problema..."} />
            </div>
            <div className="grid gap-2">
              <Label>{t("photos")}</Label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-4">
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  {lang === "en" ? "Add Photo" : "Agregar Foto"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExceptionDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => {
              toast.success(lang === "en" ? "Exception flagged" : "Excepción reportada")
              setExceptionDialogOpen(false)
            }}>
              {t("flagException")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
