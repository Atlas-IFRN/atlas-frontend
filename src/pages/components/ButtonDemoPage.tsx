import {
  ArrowRight,
  Check,
  Plus,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import './ButtonDemoPage.css'

export default function ButtonDemoPage() {
  return (
    <main className="button-demo-page">
      <header className="button-demo-header">
        <div className="button-demo-title">
          <span className="button-demo-index">03</span>
          <h1>Botões</h1>
        </div>
        <p className="button-demo-nav">
          primary · outline · soft · ghost · dark · danger
        </p>
      </header>

      <section className="button-demo-panel" aria-labelledby="button-variants">
        <h2 id="button-variants">Variantes</h2>
        <div className="button-demo-row">
          <Button variant="primary">Primário</Button>
          <Button variant="outline">Secundário</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="button-demo-panel" aria-labelledby="button-sizes">
        <h2 id="button-sizes">Tamanhos</h2>
        <div className="button-demo-row">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button variant="outline" size="pill">
            Pill
          </Button>
        </div>
      </section>

      <section className="button-demo-panel" aria-labelledby="button-states">
        <h2 id="button-states">Estados</h2>
        <div className="button-demo-row">
          <Button loading>Salvando</Button>
          <Button variant="outline" loading>
            Carregando
          </Button>
          <Button variant="ghost" disabled>
            Inativo
          </Button>
          <Button variant="danger" disabled>
            Bloqueado
          </Button>
          <Button variant="primary" disabled>
            Desativado
          </Button>
        </div>
      </section>

      <section className="button-demo-panel" aria-labelledby="button-icons">
        <h2 id="button-icons">Com ícone</h2>
        <div className="button-demo-row">
          <Button iconLeft={Check}>Confirmar</Button>
          <Button variant="outline" iconLeft={Plus}>
            Adicionar
          </Button>
          <Button variant="outline" iconLeft={Settings} aria-label="Configurar" />
          <Button variant="ghost" iconLeft={X} aria-label="Fechar" />
          <Button variant="danger" iconLeft={Trash2} iconRight={ArrowRight}>
            Excluir
          </Button>
        </div>
      </section>
    </main>
  )
}
