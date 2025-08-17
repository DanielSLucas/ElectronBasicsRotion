import ReactMarkdown from 'react-markdown';
import * as Collapsible from '@radix-ui/react-collapsible'
import clsx from "clsx";
import { CaretDown } from 'phosphor-react';

export type ChatMessage = {
  id: string;
  kind: 'AI' | 'USER';
  content: string;
  thinking?: string;
}

interface Props {
  msg: ChatMessage;
  isLoading?: boolean;
  isLast?: boolean
}

export function ChatMessageComponent({ msg, isLoading, isLast }: Props) {
  return msg.kind === "USER" ? (
    <article className={clsx("max-w-full self-end bg-rotion-700 p-2 rounded-xl", { "mb-4": isLast })}>
      <p>{msg.content}</p>
    </article>
  ) : (
    <div className='max-w-full self-start p-2 rounded-xl border-1 border-rotion-700'>
      {(isLoading && !msg.thinking) && <span className="text-xs text-rotion-300">Carregando...</span>}
        
      {msg.thinking && (
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger className={clsx('text-xs text-rotion-300 flex items-center p-1 pl-2 rounded hover:bg-rotion-600 hover:text-rotion-100 transition-colors duration-200', { "animate-pulse": isLoading })}>
            Pensamentos
            <CaretDown className="ml-2 h-3 w-3"/>
          </Collapsible.Trigger>
          <Collapsible.Content className='bg-rotion-800 p-2 rounded-xl my-1'>
            <p>{msg.thinking}</p>
          </Collapsible.Content>
        </Collapsible.Root>
      )}

      <article className="prose prose-invert prose-headings:mt-0 w-full max-w-none">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </article>
    </div>
    
  );
}
