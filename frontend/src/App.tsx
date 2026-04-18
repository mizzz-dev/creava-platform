import { AppRoutes } from '@/lib/routes'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import UserSyncBridge from '@/lib/auth/UserSyncBridge'

function App() {
  return (
    <ErrorBoundary>
      <UserSyncBridge />
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App
