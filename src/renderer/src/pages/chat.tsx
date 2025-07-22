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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([
    { id: 'conv1', title: 'General Chat' },
    { id: 'conv2', title: 'Jokes' },
    { id: 'conv3', title: 'Tech Support' },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: (messages.length + 1).toString(),
      kind: 'USER',
      content: newMessage
    };
    setMessages(prev => [...prev, userMsg, {
      id: (messages.length + 2).toString(),
      kind: 'AI',
      content: ''
    }]);
    setLoading(true);
    setNewMessage("");

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.kind === 'USER' ? 'user' : 'assistant',
      content: m.content
    }));

    try {
      const res = await fetch('http://localhost:9099/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stream: true,
          messages: apiMessages,
          model: 'default' // ajuste conforme necessário
        })
      });

      setLoading(false);

      const decoder = new TextDecoder('utf-8');
      const readable = res.body!.getReader();
      
      while (true) {
        const { done, value } = await readable!.read()

        if (done) break;

        const data = decoder.decode(value).match(/^data:\s(.+)/)
        const dataObj = JSON.parse(data![1])
        const newSlice = dataObj.choices[0].delta.content

        console.log({ newSlice })

        if (!newSlice) continue;

        setMessages(prev => {
          const lastMessage = prev[prev.length-1] 
            ? {...prev[prev.length-1]}
            : {id: (messages.length + 2).toString(), kind: 'AI', content: ""} as ChatMessage

          Object.assign(lastMessage, { content: lastMessage.content + newSlice })

          return [...prev.slice(0, prev.length-1), lastMessage]
        })
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.content === 'Carregando...'
          ? { ...m, content: 'Erro ao conectar à IA.' }
          : m
      ));
    } finally {
      setLoading(false);
    }
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
              <article key={msg.id} className="max-w-full self-end bg-rotion-700 p-2 rounded-xl">
                <p>
                  {msg.content}
                </p>
              </article>
            )
            : (
              <article key={msg.id} className="max-w-full self-start">
                {loading && (
                  <span className="text-xs text-rotion-300">Carregando...</span>
                )}
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
