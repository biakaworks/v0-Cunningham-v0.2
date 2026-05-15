import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Site: ${id}`}
      stage={2}
      description="Site details with tanks, access information, map location, and service history."
    />
  )
}
