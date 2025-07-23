export type ChatMessage = {
  id: string, 
  kind: 'AI' | 'USER',
  content: string,
}


interface Props {
  kind: 'USER' | 'AI';
  loading?: boolean;
  children: React.ReactNode;
}

export function ChatMessageComponent({ kind, loading, children }: Props) {
  return kind === "USER" ? (
    <article className="max-w-full self-end bg-rotion-700 p-2 rounded-xl">
      <p>{children}</p>
    </article>
  ) : (
    <article className="max-w-full self-start p-2 rounded-xl border-2 border-rotion-700">
      {loading && <span className="text-xs text-rotion-300">Carregando...</span>}
      <p>{children}</p>
    </article>
  );
}
