import { StagePlaceholder } from '@/components/stage-placeholder'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <StagePlaceholder
      title={`Report: ${id}`}
      stage={5}
      description="Report editor with sections, recommendations, photo attachments, and PDF generation."
    />
  )
}
