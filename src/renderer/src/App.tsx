import './styles/global.css'

import { Routes } from './Routes'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import { CurrentDocumentProvider } from './hooks/useCurrentDocument'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrentDocumentProvider>
        <Routes />
      </CurrentDocumentProvider>
    </QueryClientProvider>
  )
}
