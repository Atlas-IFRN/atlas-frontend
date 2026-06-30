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

const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
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

const TalentBankPage = lazy(
  () => import('../pages/talent-bank/TalentBankPage'),
)
const CreateRegistrationPage = lazy(
  () => import('../pages/talent-bank/CreateRegistrationPage'),
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

function LoadingPage() {
  return <main className="route-status">Carregando...</main>
}

function hasRole(role: string | undefined, roles: string[]) {
  return role !== undefined && roles.includes(role)
}

function TalentBankEntryPage() {
  const { user } = useAuth()
  const role = user?.role.trim().toLowerCase()

  if (hasRole(role, STUDENT_ROLES)) {
    return <Navigate to="/banco-talentos/registration" replace />
  }

  if (hasRole(role, TEACHER_ROLES)) {
    return <TalentBankPage />
  }

  return <Navigate to="/feed" replace />
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/componentes" element={<ComponentsDemoPage />} />

        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feed/new" element={<CreatePostPage />} />
            <Route path="/feed/:postId/edit" element={<EditPostPage />} />

            <Route path="/bolsas" element={<ScholarshipsPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route
              path="/bolsas/:scholarshipId"
              element={<ScholarshipDetailsPage />}
            />
            <Route
              path="/scholarships/:scholarshipId"
              element={<ScholarshipDetailsPage />}
            />

            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/perfil/edit" element={<EditProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profiles/:userId" element={<UserProfilePage />} />

            <Route path="/trilhas" element={<TracksPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/trilhas/:trackId" element={<TrackDetailsPage />} />
            <Route path="/tracks/:trackId" element={<TrackDetailsPage />} />
            <Route
              path="/trilhas/:trackId/modules/:moduleId"
              element={<ModuleDetailsPage />}
            />
            <Route
              path="/tracks/:trackId/modules/:moduleId"
              element={<ModuleDetailsPage />}
            />
            <Route
              path="/trilhas/:trackId/modules/:moduleId/contents/:contentId"
              element={<ContentDetailsPage />}
            />
            <Route
              path="/tracks/:trackId/modules/:moduleId/contents/:contentId"
              element={<ContentDetailsPage />}
            />

            <Route path="/banco-talentos" element={<TalentBankEntryPage />} />
            <Route path="/talent-bank" element={<TalentBankEntryPage />} />
            <Route
              path="/banco-talentos/registration"
              element={<CreateRegistrationPage />}
            />
            <Route
              path="/talent-bank/registration"
              element={<CreateRegistrationPage />}
            />
            <Route path="/banco-talentos/my-notes" element={<MyNotesPage />} />
            <Route path="/talent-bank/my-notes" element={<MyNotesPage />} />

            <Route element={<RoleRoute allowedRoles={STUDENT_ROLES} />}>
              <Route
                path="/bolsas/applications"
                element={<MyApplicationsPage />}
              />
              <Route
                path="/scholarships/applications"
                element={<MyApplicationsPage />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={TEACHER_ROLES} />}>
              <Route
                path="/painel-professor"
                element={<TeacherPanelPage />}
              />
              <Route
                path="/bolsas/new"
                element={<CreateScholarshipPage />}
              />
              <Route
                path="/scholarships/new"
                element={<CreateScholarshipPage />}
              />
              <Route
                path="/bolsas/:scholarshipId/edit"
                element={<EditScholarshipPage />}
              />
              <Route
                path="/scholarships/:scholarshipId/edit"
                element={<EditScholarshipPage />}
              />
              <Route
                path="/bolsas/:scholarshipId/applications"
                element={<ScholarshipApplicationsPage />}
              />
              <Route
                path="/scholarships/:scholarshipId/applications"
                element={<ScholarshipApplicationsPage />}
              />
              <Route path="/trilhas/new" element={<CreateTrackPage />} />
              <Route path="/tracks/new" element={<CreateTrackPage />} />
              <Route path="/trilhas/:trackId/edit" element={<EditTrackPage />} />
              <Route path="/tracks/:trackId/edit" element={<EditTrackPage />} />
              <Route
                path="/trilhas/:trackId/modules/new"
                element={<CreateModulePage />}
              />
              <Route
                path="/tracks/:trackId/modules/new"
                element={<CreateModulePage />}
              />
              <Route
                path="/trilhas/:trackId/modules/:moduleId/edit"
                element={<EditModulePage />}
              />
              <Route
                path="/tracks/:trackId/modules/:moduleId/edit"
                element={<EditModulePage />}
              />
              <Route
                path="/trilhas/:trackId/modules/:moduleId/contents/new"
                element={<CreateContentPage />}
              />
              <Route
                path="/tracks/:trackId/modules/:moduleId/contents/new"
                element={<CreateContentPage />}
              />
              <Route
                path="/trilhas/:trackId/modules/:moduleId/contents/:contentId/edit"
                element={<EditContentPage />}
              />
              <Route
                path="/tracks/:trackId/modules/:moduleId/contents/:contentId/edit"
                element={<EditContentPage />}
              />
              <Route
                path="/banco-talentos/:studentId/notes"
                element={<NotesPage />}
              />
              <Route
                path="/talent-bank/:studentId/notes"
                element={<NotesPage />}
              />
              <Route
                path="/banco-talentos/:studentId/notes/new"
                element={<CreateNotePage />}
              />
              <Route
                path="/talent-bank/:studentId/notes/new"
                element={<CreateNotePage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Suspense>
  )
}
