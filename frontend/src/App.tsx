import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { Audience } from './pages/Audience'
import { Interaction } from './pages/Interaction'
import { ContentActivity } from './pages/ContentActivity'
import { Performance } from './pages/Performance'
import { Admin } from './pages/Admin'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/ui/Toast'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/audience" element={
            <ProtectedRoute>
              <Audience />
            </ProtectedRoute>
          } />
          <Route path="/interaction" element={
            <ProtectedRoute>
              <Interaction />
            </ProtectedRoute>
          } />
          <Route path="/content-activity" element={
            <ProtectedRoute>
              <ContentActivity />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
        <ToastProvider />
      </AuthProvider>
    </Router>
  )
}

export default App
