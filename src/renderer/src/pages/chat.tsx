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
    const aiMsg = makeChatMessage("...", "AI");
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

  useEffect(() => {
    let isThinking = false;
    const offChunk = window.api.onChatStreamChunk((_, chunk: string) => {
      if (chunk === "<think>") {
        isThinking = true;
      } else if (chunk === "</think>") {
        isThinking = false;
      }

      setMessages(prev => {
        const lastMessage = prev[prev.length-1]
          ? { ...prev[prev.length-1] }
          : makeChatMessage("...", "AI");
        
        if (isThinking || chunk === "</think>") {
          Object.assign(lastMessage, { thinking: (lastMessage.thinking || '') + chunk });
        } else {
          Object.assign(lastMessage, { content: 
            lastMessage.content === "..." ? chunk : lastMessage.content + chunk 
          });
        }

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
          {messages.map((msg, idx) => (
            <Chat.Message
              key={msg.id}
              msg={msg}
              isLoading={loading}
              isLast={idx === messages.length - 1}
            />
          ))}
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
