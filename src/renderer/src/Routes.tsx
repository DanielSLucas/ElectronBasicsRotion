import { Route } from 'react-router-dom'

import { Router } from '../../lib/electron-router-dom'
import { Blank } from './pages/blank'
import { Document } from './pages/document'
import { Default } from './pages/layouts/default'
import { ChatPage } from './pages/chat'

export function Routes() {
  return (
    <Router
      main={
        <Route path="/" element={<Default />}>
          <Route path="/" element={<Blank />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/documents/:id" element={<Document />} />
        </Route>
      }
    />
  )
}
