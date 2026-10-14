import { useEffect } from 'react'

import { AuthProvider } from './context/auth-provider'
import { useAuth } from './context/useAuth'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function ProtectedHistory() {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated && window.location.pathname === '/history') {
      window.location.replace('/login')
    }
  }, [isAuthenticated, loading])

  if (loading || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-600" role="status">Checking sign-in...</div>
  }

  return <History />
}

function AppRoute() {
  switch (window.location.pathname) {
    case '/login':
      return <Login />
    case '/register':
      return <Register />
    case '/history':
      return <ProtectedHistory />
    default:
      return <Home />
  }
}

function App() {
  return (
    <AuthProvider>
      <AppRoute />
    </AuthProvider>
  )
}

export default App
