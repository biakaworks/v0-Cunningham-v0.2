import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Proposal: ${id}`}
      stage={3}
      description="Proposal details with scope, line items, follow-up tracking, and conversion to contract."
    />
  )
}
