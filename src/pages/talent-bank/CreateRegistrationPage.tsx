import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { InfoCard } from '../../components/molecules/InfoCard'
import { PageHeroCopy } from '../../components/molecules/PageHeroCopy'
import './TalentBankPage.css'

export default function CreateRegistrationPage() {
  const [isRegistered, setIsRegistered] = useState(false)

  return (
    <main className="talent-bank-page">
      <header className="talent-bank-page__header">
        <PageHeroCopy
          description="Um canal direto entre você e os professores orientadores do IFRN."
          eyebrow="NADIC · IFRN"
          title="Banco de Talentos"
        />
      </header>

      <div className="talent-bank-page__grid">
        <div className="talent-bank-page__main-column">
          <InfoCard
            className="talent-bank-page__about"
            title="O que é o Banco de Talentos?"
          >
            <p>
              O Banco de Talentos é uma vitrine curada de estudantes
              interessados em participar de bolsas de pesquisa, inovação e
              extensão do IFRN. Ao se inscrever, seu perfil técnico — trilhas
              concluídas, tecnologias validadas pela IA e desafios entregues —
              fica visível para professores orientadores.
            </p>
            <p>
              Diferente de uma simples candidatura, aqui o{' '}
              <strong>contato é ativo</strong>: os professores procuram você.
              Eles avaliam o seu portfólio no ATLAS, confirmam conhecimentos por
              entrevista e podem convidá-lo diretamente para integrar projetos
              antes mesmo de um edital ser publicado.
            </p>
          </InfoCard>

          <InfoCard
            className="talent-bank-page__steps"
            title="Como funciona"
          >
            <ol>
              <li>
                Você se inscreve e marca as áreas de interesse (PIBIC, PIBITI,
                Pesquisa, Extensão).
              </li>
              <li>
                Seu perfil é indexado com base nas trilhas concluídas e nos
                repositórios validados pela IA.
              </li>
              <li>
                Professores orientadores buscam talentos pelas competências que
                precisam para seus projetos.
              </li>
              <li>
                Você recebe o convite via Notas (chat) e pode aceitar uma
                conversa ou entrevista.
              </li>
            </ol>
          </InfoCard>
        </div>

        <aside
          aria-labelledby="talent-bank-registration-status"
          className="talent-bank-page__status"
        >
          <p className="talent-bank-page__status-eyebrow">
            Status da inscrição
          </p>
          <h2
            className="talent-bank-page__status-title"
            data-registered={isRegistered || undefined}
            id="talent-bank-registration-status"
          >
            {isRegistered ? (
              <>
                <Check aria-hidden="true" size={18} strokeWidth={2.5} />
                Inscrito no Banco de Talentos
              </>
            ) : (
              'Você ainda não está inscrito'
            )}
          </h2>
          <Button
            className={`talent-bank-page__register-button${
              isRegistered
                ? ' talent-bank-page__register-button--registered'
                : ''
            }`}
            onClick={() => setIsRegistered((registered) => !registered)}
            size="md"
            variant={isRegistered ? 'outline' : 'primary'}
          >
            {isRegistered
              ? 'Sair do Banco de Talentos'
              : 'Inscrever-se agora'}
          </Button>
          <p className="talent-bank-page__status-help">
            Sua inscrição é gratuita e pode ser cancelada a qualquer momento.
          </p>
        </aside>
      </div>
    </main>
  )
}
