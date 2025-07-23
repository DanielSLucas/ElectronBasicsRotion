import { PaperPlaneRight } from "phosphor-react";

interface Props {
  value: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ value, loading, onChange, onSubmit }: Props) {
  return (
    <div className="w-full sticky bottom-0 pb-5 bg-rotion-900">
      <form 
        className="relative flex items-center justify-between w-full bg-rotion-700 rounded-2xl"
        onSubmit={onSubmit}
      >
        <textarea
          value={value}
          onChange={onChange}
          placeholder="Pergunte alguma coisa"
          className="w-full h-6 p-5 overflow-hidden resize-y min-h-16 max-h-100"
          disabled={loading}
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
          disabled={loading}
        >
          <PaperPlaneRight />
        </button>
      </form>
    </div>
  );
}
