import {
  CheckCircle2,
  Circle,
  Home,
  Info,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { IconTile } from '../../components/atoms/IconTile'
import './IconTileDemoPage.css'

const variants = [
  { label: 'Primary', value: 'primary', icon: Info },
  { label: 'Success', value: 'success', icon: CheckCircle2 },
  { label: 'Warning', value: 'warning', icon: TriangleAlert },
  { label: 'Danger', value: 'danger', icon: XCircle },
  { label: 'Neutral', value: 'neutral', icon: Circle },
] as const

const sizes = ['sm', 'md', 'lg'] as const

export default function IconTileDemoPage() {
  return (
    <main className="icon-tile-demo-page">
      <header className="icon-tile-demo-header">
        <div className="icon-tile-demo-title">
          <span className="icon-tile-demo-index">05</span>
          <h1>IconTile</h1>
        </div>
        <p className="icon-tile-demo-nav">
          sm 32px | md 40px | lg 48px
        </p>
      </header>

      <section className="icon-tile-demo-panel" aria-labelledby="icon-tile-variants">
        <h2 id="icon-tile-variants">Variantes</h2>
        <div className="icon-tile-demo-grid">
          {variants.map(({ label, value, icon }) => (
            <div className="icon-tile-demo-item" key={value}>
              <IconTile icon={icon} variant={value} aria-label={label} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="icon-tile-demo-panel" aria-labelledby="icon-tile-sizes">
        <h2 id="icon-tile-sizes">Tamanhos</h2>
        <div className="icon-tile-demo-row">
          {sizes.map((size) => (
            <IconTile
              aria-label={`IconTile ${size}`}
              icon={Home}
              key={size}
              size={size}
            />
          ))}
        </div>
      </section>

      <section className="icon-tile-demo-panel" aria-labelledby="icon-tile-name">
        <h2 id="icon-tile-name">Registry</h2>
        <div className="icon-tile-demo-row">
          <IconTile aria-label="Inicio" name="Home" variant="primary" />
          <IconTile aria-label="Inicio sucesso" name="Home" variant="success" />
          <IconTile aria-label="Inicio neutro" name="Home" variant="neutral" />
        </div>
      </section>
    </main>
  )
}
