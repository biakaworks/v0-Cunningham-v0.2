import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function FieldCrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Field View: Project ${id}`}
      stage={6}
      description="Simplified field crew interface with daily logs, material exceptions, and photo uploads."
    />
  )
}
