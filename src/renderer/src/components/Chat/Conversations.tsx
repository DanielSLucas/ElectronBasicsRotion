export type ChatConversation = {
  id: string, 
  title: string
}

interface Props {
  conversations: ChatConversation[];
}

export function ChatConversations({ conversations }: Props) {
  return (
    <aside className="w-1/6 hidden lg:block sticky top-0 ml-10 py-12">
      <span className="text-rotion-300 font-semibold px-2">Chats</span>
      <div className="flex flex-col items-start mt-2">
        {conversations.map(conversation => (
          <div key={conversation.id} className="flex items-center text-sm gap-2 text-rotion-100 hover:text-rotion-50 py-1 px-2 w-full rounded group hover:bg-rotion-700">
            {conversation.title}
          </div>
        ))}
      </div>
    </aside>
  );
}
