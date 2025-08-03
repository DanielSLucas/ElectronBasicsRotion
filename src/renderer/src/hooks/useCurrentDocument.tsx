import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useState } from 'react'
import { Document } from '@shared/types/ipc'
import { OnContentUpdatedParams } from '../components/Editor'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface CurrentDocumentData {
  // Document data
  document: Document | null | undefined
  isFetching: boolean
  error: Error | null
  
  // Save operations
  saveDocument: (params: OnContentUpdatedParams) => Promise<void>
  forceSave: () => Promise<void>
  isSaving: boolean
  saveError: Error | null
  
  // Delete operations
  deleteDocument: (options?: { skipConfirmation?: boolean }) => Promise<void>
  isDeleting: boolean
  deleteError: Error | null
  
  // Combined loading state
  isLoading: boolean
  
  // Helper to check if operations should be disabled
  isOperationDisabled: boolean

  // Set current document ID
  setCurrentDocumentId: (id: string | null) => void
}

const CurrentDocumentContext = createContext<CurrentDocumentData>({} as CurrentDocumentData)

interface CurrentDocumentProviderProps {
  children: ReactNode
}

export function CurrentDocumentProvider({ children }: CurrentDocumentProviderProps) {
  const queryClient = useQueryClient()
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)

  // Fetch document query
  const {
    data: document,
    isFetching,
    error,    
  } = useQuery({
    queryKey: ['document', currentDocumentId],
    queryFn: async () => {
      if (!currentDocumentId) return null
      const response = await window.api.fetchDocument({ id: currentDocumentId })
      return response?.data
    },
    enabled: !!currentDocumentId,
  })

  // Save document mutation
  const {
    mutateAsync: saveDocumentMutation,
    isPending: isSaving,
    error: saveError
  } = useMutation({
    mutationKey: ['saveDocument', currentDocumentId],
    mutationFn: async ({ title, content }: OnContentUpdatedParams) => {
      if (!currentDocumentId) throw new Error('Document ID is required')
      await sleep(3000)
      await window.api.saveDocument({
        id: currentDocumentId,
        name: title,
        content,
      })
    },
    onSuccess: (_, { title }) => {
      // Update the documents list in cache
      queryClient.setQueryData<Document[]>(['documents'], (documents) => {
        return documents?.map(doc => {
          return doc.id === currentDocumentId
            ? { ...doc, name: title }
            : doc
        })
      })
      
      // Update the current document in cache
      queryClient.setQueryData(['document', currentDocumentId], (currentDoc: Document | undefined) => {
        if (currentDoc) {
          return { ...currentDoc, name: title }
        }
        return currentDoc
      })
    },
  })

  // Delete document mutation
  const {
    mutateAsync: deleteDocumentMutation,
    isPending: isDeleting,
    error: deleteError
  } = useMutation({
    mutationFn: async () => {
      if (!currentDocumentId) throw new Error('Document ID is required')
      await window.api.deleteDocument({ id: currentDocumentId })
    },
    onSuccess: () => {
      // Remove document from documents list cache
      queryClient.setQueryData<Document[]>(['documents'], (documents) => {
        return documents?.filter(doc => doc.id !== currentDocumentId) || []
      })
      
      // Remove document from cache
      queryClient.removeQueries({ queryKey: ['document', currentDocumentId] })
    },
  })

  // Helper function to handle save with confirmation
  const handleSave = async (params: OnContentUpdatedParams) => {
    try {
      await saveDocumentMutation(params)
    } catch (error) {
      console.error('Failed to save document:', error)
      throw error
    }
  }

  // Helper function to trigger immediate save (for manual save button)
  const handleForceSave = async () => {
    if (!document) {
      console.warn('No document loaded to save')
      return
    }

    try {
      // Use the current document content as-is
      await saveDocumentMutation({
        title: document.name,
        content: document.content || ''
      })
    } catch (error) {
      console.error('Failed to force save document:', error)
      throw error
    }
  }

  // Helper function to handle delete with confirmation
  const handleDelete = async (options?: { skipConfirmation?: boolean }) => {
    const shouldDelete = options?.skipConfirmation || 
      window.confirm('Tem certeza que deseja deletar esse documento?')
    
    if (shouldDelete) {
      try {
        await deleteDocumentMutation()
      } catch (error) {
        console.error('Failed to delete document:', error)
        throw error
      }
    }
  }

  const value = {
    // Document data
    document,
    isFetching,
    error,
    
    // Save operations
    saveDocument: handleSave,
    forceSave: handleForceSave,
    isSaving,
    saveError,
    
    // Delete operations
    deleteDocument: handleDelete,
    isDeleting,
    deleteError,
    
    // Combined loading state
    isLoading: isFetching || isSaving || isDeleting,
    
    // Helper to check if operations should be disabled
    isOperationDisabled: isSaving || isDeleting,

    // Set current document ID
    setCurrentDocumentId,
  }

  return (
    <CurrentDocumentContext.Provider value={value}>
      {children}
    </CurrentDocumentContext.Provider>
  )
}

export function useCurrentDocument(): CurrentDocumentData {
  const context = useContext(CurrentDocumentContext)

  if (!context) {
    throw new Error('useCurrentDocument must be used within a CurrentDocumentProvider')
  }

  return context
}
