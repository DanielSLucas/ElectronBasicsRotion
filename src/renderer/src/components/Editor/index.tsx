import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export function Editor() {
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
    content: '<h1>Back-end</h1><p>Doc sobre back-end</p>',
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose prose-invert prose-headings:mt-0',
      },
    },
  })

  return (
    <EditorContent className="w-[65ch]" editor={editor} />
  )
}
