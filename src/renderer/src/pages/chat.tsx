import { useState, useEffect, useRef } from "react";
import { Chat, ChatConversation, ChatMessage } from "../components/Chat";


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
      await window.api.startChatStream(apiMessages);
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.content === '' && m.kind === "AI"
          ? { ...m, content: 'Erro ao conectar à IA.' }
          : m
      ));
      setLoading(false);
    }
  };

  // Efeito para lidar com chunks do stream
  useEffect(() => {
    const offChunk = window.api.onChatStreamChunk((_, chunk: string) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length-1]
          ? { ...prev[prev.length-1] }
          : makeChatMessage("", "AI");
        Object.assign(lastMessage, { content: lastMessage.content + chunk });
        return [...prev.slice(0, prev.length-1), lastMessage];
      });
    });
    const offEnd = window.api.onChatStreamEnd(() => {
      setLoading(false);
    });
    return () => {
      offChunk();
      offEnd();
    };
  }, []);

  // Ref para o container de mensagens
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automático ao adicionar mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Chat.Root>
      <Chat.Conversations conversations={conversations} />
      <section className="w-5/6 flex flex-col items-center ml-10 flex-1 min-h-0 mr-10">
        <Chat.MessagesContainer>
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const messageNode = (
              <Chat.Message
                kind={msg.kind}
                loading={loading}
              >
                {msg.content}
              </Chat.Message>
            );
            return isLast ? (
              <div key={msg.id} className="mb-4">
                {messageNode}
              </div>
            ) : messageNode;
          })}
          <div ref={messagesEndRef} />
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
