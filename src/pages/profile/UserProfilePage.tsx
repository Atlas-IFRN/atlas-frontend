import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProfilePage from './ProfilePage'
import { RoutePage } from '../RoutePage'

export default function UserProfilePage() {
  const { matricula } = useParams<{ matricula: string }>()
  const { user } = useAuth()

  if (matricula === user?.matricula) {
    return <ProfilePage />
  }

  return <RoutePage title="Perfil do usuário" />
}
