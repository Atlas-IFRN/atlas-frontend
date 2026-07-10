import { Link } from 'react-router-dom'

interface TrailBreadcrumbProps {
  title: string
}

export function TrailBreadcrumb({ title }: TrailBreadcrumbProps) {
  return (
    <nav className="trail-breadcrumb" aria-label="Breadcrumb">
      <Link to="/trilhas">Trilhas</Link>
      <span aria-hidden="true">/</span>
      <strong>{title}</strong>
    </nav>
  )
}
