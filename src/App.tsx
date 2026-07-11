import { AppRoutes } from './routes/AppRoutes'
import { DocumentTitle } from './routes/DocumentTitle'
import { Toaster } from 'sonner'
import './App.css'

function App() {
  return (
    <>
      <DocumentTitle />
      <AppRoutes />
      <Toaster richColors theme="dark" position="top-right" />
    </>
  )
}

export default App
