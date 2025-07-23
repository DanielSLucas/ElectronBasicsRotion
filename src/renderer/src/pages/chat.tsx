import { useState } from "react";
import { Chat, ChatConversation, ChatMessage } from "../components/Chat";
import { getChatCompletion } from "../lib/llm";

function makeChatMessage(msg: string, kind: "USER" | "AI"): ChatMessage {
  return {
    id: `${kind}_${Date.now()}`,
    kind,
    content: msg
  }
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations] = useState<ChatConversation[]>([
    { id: 'conv1', title: 'General Chat' },
    { id: 'conv2', title: 'Jokes' },
    { id: 'conv3', title: 'Tech Support' },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = makeChatMessage(newMessage, "USER");
    const aiMsg = makeChatMessage("", "AI");
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setLoading(true);
    setNewMessage("");

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.kind === 'USER' ? 'user' : 'assistant',
      content: m.content
    }));

    try {
      const decoder = new TextDecoder('utf-8');
      const readable = await getChatCompletion(apiMessages);

      setLoading(false);

      while (true) {
        const { done, value } = await readable!.read();
        if (done) break;

        const data = decoder.decode(value).match(/^data:\s(.+)/);
        const dataObj = JSON.parse(data![1]);
        const newSlice = dataObj.choices[0].delta.content;

        if (!newSlice) continue;

        setMessages(prev => {
          const lastMessage = prev[prev.length-1]
            ? { ...prev[prev.length-1] }
            : makeChatMessage("", "AI");

          Object.assign(lastMessage, { content: lastMessage.content + newSlice });
          return [...prev.slice(0, prev.length-1), lastMessage];
        });
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
    <Chat.Root>
      <Chat.Conversations conversations={conversations} />
      <section className="w-5/6 flex flex-col items-center ml-10 flex-1 min-h-0 mr-10">
        <Chat.MessagesContainer>
          {messages.map(msg => (
            <Chat.Message key={msg.id} kind={msg.kind} loading={loading}>
              {msg.content}
            </Chat.Message>
          ))}
        </Chat.MessagesContainer>

        <Chat.Input
          value={newMessage}
          loading={loading}
          onChange={(e) => setNewMessage(e.target.value)}
          onSubmit={handleSubmit}
        />
      </section>
    </Chat.Root>
  );
}
