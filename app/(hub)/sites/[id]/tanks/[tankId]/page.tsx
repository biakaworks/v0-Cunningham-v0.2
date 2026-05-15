import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string; tankId: string }>
}) {
  const { id, tankId } = await params
  
  return (
    <StagePlaceholder
      title={`Tank: ${tankId}`}
      stage={2}
      description={`Tank specifications, inspection history, service records, and recommendations for site ${id}.`}
    />
  )
}
