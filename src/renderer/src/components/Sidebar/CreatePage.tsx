import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'phosphor-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Document } from '~/src/shared/types/ipc'

export function CreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { isPending, mutateAsync: createDocument } = useMutation({
    mutationFn: async () => {
      const response = await window.api.createDocument()

      return response.data
    },
    onSuccess: (data) => {
      // queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.setQueryData<Document[]>(['documents'], (documents) => {
        if (documents && documents?.length >= 0) {
          return [...documents, data]
        } else {
          return [data]
        }
      })

      navigate(`/documents/${data.id}`)
    },
  })

  useEffect(() => {
    function onNewDocument() {
      createDocument()
    }

    const unsubscribe = window.api.onNewDocumentRequest(onNewDocument)

    return () => {
      unsubscribe()
    }
  }, [createDocument])

  return (
    <button
      onClick={() => createDocument()}
      disabled={isPending}
      className="flex w-[240px] px-5 items-center text-sm gap-2 absolute bottom-0 left-0 right-0 py-4 border-t border-rotion-600 bg-rotion-800 hover:bg-rotion-700 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      Novo documento
    </button>
  )
}
