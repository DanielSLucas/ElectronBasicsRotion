import { ReactNode } from "react";

export function ChatRoot({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 min-h-0 overflow-y-auto">
      {children}
    </main>
  );
}
