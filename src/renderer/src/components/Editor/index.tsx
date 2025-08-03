import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useRef, useEffect } from 'react'

export type OnContentUpdatedParams = {
  title: string;
  content: string;
}

type EditorProps = {
  content: string;
  onContentUpdated: (params: OnContentUpdatedParams) => void;
  debounceMs?: number;
}

export function Editor({ content, onContentUpdated, debounceMs = 500 }: EditorProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedOnContentUpdated = useCallback((params: OnContentUpdatedParams) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      onContentUpdated(params)
    }, debounceMs)
  }, [onContentUpdated, debounceMs])

  const editor = useEditor({
    extensions: [
      Document.extend({
        content: 'heading block*',
      }), // define a estrutura do documento, nesse caso sempre começa com h1
      StarterKit.configure({
        document: false,
      }), // basico para o editor funcionar
      Highlight, // permite usar markdown
      Typography,
      Placeholder.configure({
        placeholder: 'Untitled',
        emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-gray-500 before:h-0 before:float-left before:pointer-events-none',
      }), // Cofigura o placeholder do editor de texto
    ],
    onUpdate: ({ editor }) => {
      const contentRegex = /(<h1>(?<title>.+)<\/h1>(?<content>.+)?)/
      const parsedContent = editor.getHTML().match(contentRegex)?.groups

      const title = parsedContent?.title ?? 'Untitled'
      const content = parsedContent?.content ?? ''
      debouncedOnContentUpdated({ title, content })
    },
    content,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose prose-invert prose-headings:mt-0',
      },
    },
  })

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <EditorContent className="w-[65ch]" editor={editor} />
  )
}
