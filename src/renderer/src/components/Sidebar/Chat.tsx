import { ChatDots } from 'phosphor-react'
import { useNavigate } from 'react-router-dom'

export function Chat() {
  const navigate = useNavigate()

  return (
    <button
      className="text-rotion-100 flex mx-3.5 items-center gap-2 text-sm font-medium group hover:bg-rotion-700 p-1.5 rounded"
      onClick={() => navigate("/chat")}
    >
      <ChatDots className="h-5 w-5 text-rotion-300" />
      Chat
    </button>
  )
}
