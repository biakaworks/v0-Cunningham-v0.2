import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Project: ${id}`}
      stage={6}
      description="Project dashboard with tasks, materials, equipment, daily logs, and billing."
    />
  )
}
