import { Construction } from 'lucide-react'

interface StagePlaceholderProps {
  title: string
  stage: number
  description?: string
}

export function StagePlaceholder({
  title,
  stage,
  description,
}: StagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Construction className="w-6 h-6 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {description || `Coming in Stage ${stage}`}
      </p>
    </div>
  )
}
