import type { ReactNode } from 'react'

interface RoutePageProps {
  title: string
  children?: ReactNode
}

export function RoutePage({ title, children }: RoutePageProps) {
  return (
    <main className="route-status">
      <section>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  )
}
