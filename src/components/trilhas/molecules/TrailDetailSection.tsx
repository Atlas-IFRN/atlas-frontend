import type { ReactNode } from 'react'

interface TrailDetailSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function TrailDetailSection({
  title,
  children,
  className,
}: TrailDetailSectionProps) {
  const sectionClassName = ['trail-detail-section', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClassName}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  )
}
