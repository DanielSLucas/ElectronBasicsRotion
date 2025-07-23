import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ChatMessagesContainer({ children }: Props) {
  return (
    <div className="w-full pt-12 px-4 flex-1 flex flex-col gap-4 text-justify">
      {children}
    </div>
  );
}
