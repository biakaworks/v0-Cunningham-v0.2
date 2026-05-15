import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Customer: ${id}`}
      stage={2}
      description="Customer profile with contacts, sites, service history, proposals, projects, and timeline."
    />
  )
}
