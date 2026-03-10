import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { Audience } from './pages/Audience'
import { Interaction } from './pages/Interaction'
import { ContentActivity } from './pages/ContentActivity'
import { Performance } from './pages/Performance'
import { Admin } from './pages/Admin'
import { ToastProvider } from './components/ui/Toast'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/interaction" element={<Interaction />} />
        <Route path="/content-activity" element={<ContentActivity />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <ToastProvider />
    </Router>
  )
}

export default App
