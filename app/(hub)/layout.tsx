import { AppShell } from '@/components/app-shell'
import { CommandPalette } from '@/components/command-palette'

export default function HubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <CommandPalette />
    </>
  )
}
