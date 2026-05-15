import { StagePlaceholder } from '@/components/stage-placeholder'

export default function PipelinePage() {
  return (
    <StagePlaceholder
      title="Sales Pipeline"
      stage={3}
      description="Pipeline overview with Kanban, table, and map views. Track proposals by status, aging, and value."
    />
  )
}
