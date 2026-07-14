import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const AuthCallbackPage = lazy(() => import('../pages/auth/AuthCallbackPage'))

const ComponentsDemoPage = lazy(
  () => import('../pages/components/ComponentsDemoPage'),
)
const FeedPage = lazy(() => import('../pages/feed/FeedPage'))
const CreatePostPage = lazy(() => import('../pages/feed/CreatePostPage'))
const EditPostPage = lazy(() => import('../pages/feed/EditPostPage'))
const PostPermalinkPage = lazy(() => import('../pages/feed/PostPermalinkPage'))

const ScholarshipsPage = lazy(
  () => import('../pages/scholarships/ScholarshipsPage'),
)
const ScholarshipDetailsPage = lazy(
  () => import('../pages/scholarships/ScholarshipDetailsPage'),
)
const CreateScholarshipPage = lazy(
  () => import('../pages/scholarships/CreateScholarshipPage'),
)
const EditScholarshipPage = lazy(
  () => import('../pages/scholarships/EditScholarshipPage'),
)
const MyApplicationsPage = lazy(
  () => import('../pages/scholarships/applications/MyApplicationsPage'),
)
const ScholarshipApplicationsPage = lazy(
  () =>
    import(
      '../pages/scholarships/applications/ScholarshipApplicationsPage'
    ),
)

const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'))
const EditProfilePage = lazy(() => import('../pages/profile/EditProfilePage'))

const TracksPage = lazy(() => import('../pages/tracks/TracksPage'))
const TrackDetailsPage = lazy(
  () => import('../pages/tracks/TrackDetailsPage'),
)
const CreateTrackPage = lazy(() => import('../pages/tracks/CreateTrackPage'))
const EditTrackPage = lazy(() => import('../pages/tracks/EditTrackPage'))
const ModuleDetailsPage = lazy(
  () => import('../pages/tracks/modules/ModuleDetailsPage'),
)
const CreateModulePage = lazy(
  () => import('../pages/tracks/modules/CreateModulePage'),
)
const EditModulePage = lazy(
  () => import('../pages/tracks/modules/EditModulePage'),
)
const ContentDetailsPage = lazy(
  () => import('../pages/tracks/contents/ContentDetailsPage'),
)
const CreateContentPage = lazy(
  () => import('../pages/tracks/contents/CreateContentPage'),
)
const EditContentPage = lazy(
  () => import('../pages/tracks/contents/EditContentPage'),
)

const SearchResultsPage = lazy(() => import('../pages/search/SearchResultsPage'))

const TalentBankPage = lazy(
  () => import('../pages/talent-bank/TalentBankPage'),
)
const MyNotesPage = lazy(
  () => import('../pages/talent-bank/MyNotesPage'),
)
const NotesPage = lazy(
  () => import('../pages/talent-bank/NotesPage'),
)
const CreateNotePage = lazy(
  () => import('../pages/talent-bank/CreateNotePage'),
)
const TeacherPanelPage = lazy(
  () => import('../pages/teacher-panel/TeacherPanelPage'),
)

const TEACHER_ROLES = ['teacher', 'professor']
const STUDENT_ROLES = ['student', 'aluno']

function MyProfileRedirect() {
  const { user } = useAuth()

  return (
    <Navigate
      to={user?.matricula
        ? `/perfil/${encodeURIComponent(user.matricula)}`
        : '/inicio'}
      replace
    />
  )
}

export function AppRoutes() {
  return (
    <Suspense>
      <Routes>
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/componentes" element={<ComponentsDemoPage />} />

        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>
            <Route path="/inicio" element={<FeedPage />} />

            <Route path="/busca" element={<SearchResultsPage />} />
            <Route path="/inicio/novo" element={<CreatePostPage />} />
            <Route path="/inicio/post/:postId" element={<PostPermalinkPage />} />
            <Route path="/inicio/:postId/editar" element={<EditPostPage />} />

            <Route path="/bolsas" element={<ScholarshipsPage />} />
            <Route
              path="/bolsas/:scholarshipId"
              element={<ScholarshipDetailsPage />}
            />

            <Route path="/perfil" element={<MyProfileRedirect />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
            <Route path="/perfil/:matricula" element={<UserProfilePage />} />

            <Route path="/trilhas" element={<TracksPage />} />
            <Route path="/trilhas/:trackId" element={<TrackDetailsPage />} />
            <Route
              path="/trilhas/:trackId/modulos/:moduleId"
              element={<ModuleDetailsPage />}
            />
            <Route
              path="/trilhas/:trackId/modulos/:moduleId/conteudos/:contentId"
              element={<ContentDetailsPage />}
            />

            <Route path="/banco-talentos" element={<TalentBankPage />} />
            <Route path="/banco-talentos/minhas-notas" element={<MyNotesPage />} />
            <Route path="/notas" element={<MyNotesPage />} />

            <Route element={<RoleRoute allowedRoles={STUDENT_ROLES} />}>
              <Route
                path="/bolsas/minhas-candidaturas"
                element={<MyApplicationsPage />}
              />
              <Route
                path="/bolsas/candidaturas"
                element={<Navigate to="/bolsas/minhas-candidaturas" replace />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={TEACHER_ROLES} />}>
              <Route
                path="/professor"
                element={<TeacherPanelPage />}
              />
              <Route
                path="/professor/notas"
                element={<NotesPage />}
              />
              <Route
                path="/bolsas/nova"
                element={<CreateScholarshipPage />}
              />
              <Route
                path="/bolsas/:scholarshipId/editar"
                element={<EditScholarshipPage />}
              />
              <Route
                path="/bolsas/:scholarshipId/candidaturas"
                element={<ScholarshipApplicationsPage />}
              />
              <Route path="/trilhas/nova" element={<CreateTrackPage />} />
              <Route path="/trilhas/:trackId/editar" element={<EditTrackPage />} />
              <Route
                path="/trilhas/:trackId/modulos/novo"
                element={<CreateModulePage />}
              />
              <Route
                path="/trilhas/:trackId/modulos/:moduleId/editar"
                element={<EditModulePage />}
              />
              <Route
                path="/trilhas/:trackId/modulos/:moduleId/conteudos/novo"
                element={<CreateContentPage />}
              />
              <Route
                path="/trilhas/:trackId/modulos/:moduleId/conteudos/:contentId/editar"
                element={<EditContentPage />}
              />
              <Route
                path="/banco-talentos/:studentId/notas"
                element={<NotesPage />}
              />
              <Route
                path="/banco-talentos/:studentId/notas/nova"
                element={<CreateNotePage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </Suspense>
  )
}
