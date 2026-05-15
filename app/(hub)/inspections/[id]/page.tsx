import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Inspection: ${id}`}
      stage={4}
      description="Field inspection workflow with checklists, photo capture, measurements, and bilingual support."
    />
  )
}
