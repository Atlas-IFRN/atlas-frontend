import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import CreateRegistrationPage from './CreateRegistrationPage'
import TeacherTalentBankView from './TeacherTalentBankView'

const STUDENT_ROLES = new Set(['student', 'aluno'])
const TEACHER_ROLES = new Set(['teacher', 'professor'])

export default function TalentBankPage() {
  const { user } = useAuth()
  const role = user?.role.trim().toLowerCase()

  if (role && STUDENT_ROLES.has(role)) {
    return <CreateRegistrationPage />
  }

  if (!role || !TEACHER_ROLES.has(role)) {
    return <Navigate to="/inicio" replace />
  }

  return <TeacherTalentBankView />
}
