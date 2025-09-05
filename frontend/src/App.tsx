import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { QueryRunner } from './pages/QueryRunner'
import { SelectorWatch } from './pages/SelectorWatch'
import { TrendAnalysis } from './pages/TrendAnalysis'
import { Jobs } from './pages/Jobs'
import { Settings } from './pages/Settings'
import { AutocompletePage } from './pages/AutocompletePage'
import { Layout } from './components/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/query" element={<QueryRunner />} />
            <Route path="/autocomplete" element={<AutocompletePage />} />
            <Route path="/selectors" element={<SelectorWatch />} />
            <Route path="/trends" element={<TrendAnalysis />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  )
}

export default App