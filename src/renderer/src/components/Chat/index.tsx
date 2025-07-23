import { ChatConversations, ChatConversation } from "./Conversations";
import { ChatInput } from "./Input";
import { ChatMessageComponent, ChatMessage } from "./Message";
import { ChatRoot } from "./Root";
import { ChatMessagesContainer } from './MessagesContainer';

export const Chat = {
  Root: ChatRoot,
  Conversations: ChatConversations,
  Message: ChatMessageComponent,
  MessagesContainer: ChatMessagesContainer,
  Input: ChatInput
}

export type { ChatConversation, ChatMessage };
