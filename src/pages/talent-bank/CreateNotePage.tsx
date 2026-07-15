import { Navigate, useLocation, useParams } from 'react-router-dom'
import NotesPage from './NotesPage'

interface CreateNoteLocationState {
  returnTo?: unknown
}

export default function CreateNotePage() {
  const { studentId } = useParams<{ studentId: string }>()
  const location = useLocation()

  const navigationState = location.state as CreateNoteLocationState | null
  const stateReturnTo = navigationState?.returnTo
  const defaultReturnTo = '/professor/notas'
  const returnTo =
    typeof stateReturnTo === 'string' && stateReturnTo.startsWith('/')
      ? stateReturnTo
      : defaultReturnTo

  return studentId ? (
    <NotesPage
      createNoteReturnTo={returnTo}
      createNoteStudentId={studentId}
    />
  ) : (
    <Navigate to="/professor/notas" replace />
  )
}
