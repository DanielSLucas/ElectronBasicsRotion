import { PaperPlaneRight } from "phosphor-react";
import { useState } from "react";

type ChatMessage = {
  id: string, 
  kind: 'AI' | 'USER',
  content: string,
}

type ChatConversation = {
  id: string, 
  title: string
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', kind: 'USER', content: 'Hello, AI!' },
    { id: '2', kind: 'AI', content: 'Hello! How can I help you today?' },
    { id: '3', kind: 'USER', content: 'Tell me a joke.' },
    { id: '4', kind: 'AI', content: 'Why did the developer go broke? Because he used up all his cache.' },
  ]);
  const [conversations, setConversations] = useState<ChatConversation[]>([
    { id: 'conv1', title: 'General Chat' },
    { id: 'conv2', title: 'Jokes' },
    { id: 'conv3', title: 'Tech Support' },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextKind: 'USER' | 'AI' =
      messages.length === 0
        ? 'USER'
        : messages[messages.length - 1].kind === 'USER'
        ? 'AI'
        : 'USER';

    const newMsg: ChatMessage = {
      id: (messages.length + 1).toString(),
      kind: nextKind,
      content: newMessage
    };

    setMessages([...messages, newMsg]);
    setNewMessage("")
  };

  return (
    <main className="flex flex-1 min-h-0 overflow-y-auto">
      <aside className="w-1/6 hidden lg:block sticky top-0 ml-10 py-12">
        <span className="text-rotion-300 font-semibold px-2">
          Chats
        </span>
       
        <div className="flex flex-col items-start mt-2">
          {conversations.map(conversation => (
            <div key={conversation.id} className="flex items-center text-sm gap-2 text-rotion-100 hover:text-rotion-50 py-1 px-2 w-full rounded group hover:bg-rotion-700">
              {conversation.title}
            </div>
          ))}
        </div>
      </aside>
      
      <section className="w-5/6 flex flex-col items-center ml-10 flex-1 min-h-0 mr-10">
        <div className="w-full pt-12 px-4 flex-1 flex flex-col gap-4">
          {messages.map(msg => 
            msg.kind === "USER"
            ? (
              <article key={msg.id} className="max-w-3/5 self-end bg-rotion-700 p-2 rounded-xl">
                <p>
                  {msg.content}
                </p>
              </article>
            )
            : (
              <article key={msg.id} className="max-w-3/5 self-start">
                <p>
                  {msg.content}
                </p>
              </article>
            )
          )}
        </div>

        <div className="w-full sticky bottom-0 pb-5 bg-rotion-900">
          <form 
            className="relative flex items-center justify-between w-full bg-rotion-700 rounded-2xl"
            onSubmit={handleSubmit}
          >
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Pergunte alguma coisa"
              className="w-full h-6 p-5 overflow-hidden resize-y min-h-16 max-h-100"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }}
            />
            <button 
              type="submit"
              className="text-rotion-20 hover:text-rotion-50 absolute right-2 bottom-2 rounded p-2 bg-rotion-600 hover:bg-rotion-500 transition-colors duration-200"
            >
              <PaperPlaneRight />
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
