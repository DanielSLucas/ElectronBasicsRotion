import { ReactNode } from 'react'

interface SectionContentProps {
  children: ReactNode
}

export function SectionContent(props: SectionContentProps) {
  return <div className="flex flex-col gap-px mb-4 scrollbar-hidden" {...props} />
}
