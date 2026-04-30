import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import Parts from './pages/Parts'
import Charts from './pages/Charts'
import Tax from './pages/Tax'
import Settings from './pages/Settings'
import Export from './pages/Export'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="logs" element={<Logs />} />
          <Route path="parts" element={<Parts />} />
          <Route path="charts" element={<Charts />} />
          <Route path="tax" element={<Tax />} />
          <Route path="export" element={<Export />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
