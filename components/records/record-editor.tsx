"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FieldConfig {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "readonly" | "link" | "currency"
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  linkTo?: string // For link fields, the route to navigate
  colSpan?: 1 | 2 // Grid column span
  hidden?: boolean
}

export interface RecordEditorProps<T extends Record<string, unknown>> {
  title: string
  data: T | null
  fields: FieldConfig[]
  onSave?: (data: Partial<T>) => Promise<void>
  isLoading?: boolean
  readOnly?: boolean
  className?: string
}

export function RecordEditor<T extends Record<string, unknown>>({
  title,
  data,
  fields,
  onSave,
  isLoading = false,
  readOnly = false,
  className,
}: RecordEditorProps<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<T>>({})
  const [isPending, startTransition] = useTransition()

  const handleEdit = () => {
    setEditedData(data || {})
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedData({})
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!onSave) return
    startTransition(async () => {
      await onSave(editedData)
      setIsEditing(false)
      setEditedData({})
    })
  }

  const handleFieldChange = (name: string, value: unknown) => {
    setEditedData((prev) => ({ ...prev, [name]: value }))
  }

  const getValue = (name: string) => {
    if (isEditing) {
      return editedData[name as keyof T] ?? data?.[name as keyof T] ?? ""
    }
    return data?.[name as keyof T] ?? ""
  }

  const visibleFields = fields.filter((f) => !f.hidden)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1 h-4 w-4" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleFields.map((field) => (
            <div
              key={field.name}
              className={cn(
                "space-y-2",
                field.colSpan === 2 && "md:col-span-2"
              )}
            >
              <Label htmlFor={field.name} className="text-muted-foreground text-sm">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <FieldRenderer
                field={field}
                value={getValue(field.name)}
                isEditing={isEditing && field.type !== "readonly"}
                onChange={(value) => handleFieldChange(field.name, value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface FieldRendererProps {
  field: FieldConfig
  value: unknown
  isEditing: boolean
  onChange: (value: unknown) => void
}

function FieldRenderer({ field, value, isEditing, onChange }: FieldRendererProps) {
  const stringValue = String(value ?? "")

  if (!isEditing || field.type === "readonly") {
    // Display mode
    if (field.type === "checkbox") {
      return (
        <div className="flex items-center h-10">
          <Checkbox checked={Boolean(value)} disabled />
        </div>
      )
    }

    if (field.type === "select" && field.options) {
      const option = field.options.find((o) => o.value === stringValue)
      return (
        <div className="flex h-10 items-center text-sm">
          {option?.label || stringValue || "-"}
        </div>
      )
    }

    if (field.type === "currency") {
      const numValue = Number(value) || 0
      return (
        <div className="flex h-10 items-center text-sm font-medium">
          {numValue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </div>
      )
    }

    if (field.type === "link" && field.linkTo && stringValue) {
      return (
        <a
          href={`${field.linkTo}/${stringValue}`}
          className="text-primary flex h-10 items-center text-sm underline-offset-4 hover:underline"
        >
          {stringValue}
        </a>
      )
    }

    return (
      <div className="flex min-h-10 items-center text-sm">
        {stringValue || "-"}
      </div>
    )
  }

  // Edit mode
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={field.name}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      )

    case "number":
      return (
        <Input
          id={field.name}
          type="number"
          value={stringValue}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
        />
      )

    case "date":
      return (
        <Input
          id={field.name}
          type="date"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "select":
      return (
        <Select value={stringValue} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "checkbox":
      return (
        <div className="flex h-10 items-center">
          <Checkbox
            id={field.name}
            checked={Boolean(value)}
            onCheckedChange={onChange}
          />
        </div>
      )

    case "currency":
      return (
        <div className="relative">
          <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
            $
          </span>
          <Input
            id={field.name}
            type="number"
            value={stringValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
      )

    default:
      return (
        <Input
          id={field.name}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
  }
}
