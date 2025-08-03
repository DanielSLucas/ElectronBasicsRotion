import { useParams } from 'react-router-dom'
import { Editor, OnContentUpdatedParams } from '../components/Editor'
import { ToC } from '../components/ToC'
import { useEffect, useMemo } from 'react'
import { useCurrentDocument } from '../hooks/useCurrentDocument'

export function Document() {
  const { id } = useParams<{ id: string }>()
  const { document, isFetching, saveDocument, setCurrentDocumentId } = useCurrentDocument()
  
  useEffect(() => {
    setCurrentDocumentId(id!)
  }, [id])

  const initialContent = useMemo(() => {
    if (document) {
      return `<h1>${document.name}</h1>${document.content ?? '<p></p>'}`
    }
    return ''
  }, [document])

  function handleEditorContentUpdated(params: OnContentUpdatedParams) {
    saveDocument(params)
  }

  return (
    <main className="flex-1 flex py-12 px-10 gap-8">
      <aside className="hidden lg:block sticky top-0">
        <span className="text-rotion-300 font-semibold text-xs">
          TABLE OF CONTENTS
        </span>

        <ToC.Root>
          <ToC.Link>Back-end</ToC.Link>
          <ToC.Section>
            <ToC.Link>auth</ToC.Link>
            <ToC.Link>db</ToC.Link>
          </ToC.Section>
        </ToC.Root>
      </aside>

      <section className="flex-1 flex flex-col items-center">
        {!isFetching && document && (
          <Editor
            content={initialContent}
            onContentUpdated={handleEditorContentUpdated}
            debounceMs={5000}
          />
        )}
      </section>
    </main>
  )
}
