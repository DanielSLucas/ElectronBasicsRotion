import clsx from 'clsx'
import { Code, CaretDoubleRight, Trash, FloppyDisk } from 'phosphor-react'
import * as Collapsible from '@radix-ui/react-collapsible'

import * as Breadcrumbs from './Breadcrumbs'
import { useNavigate, useParams } from 'react-router-dom'
import { useCurrentDocument } from '../../hooks/useCurrentDocument'
import { Spinner } from '../Spinner'

type HeaderProps = {
  isSidebarOpen: boolean
}

export function Header({ isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>()
  const { 
    document, 
    deleteDocument: delDoc,
    forceSave,
    isSaving,
    isDeleting,
    setCurrentDocumentId, 
    isOperationDisabled 
  } = useCurrentDocument()

  const isMacOS = process.platform === 'darwin'

  const deleteDocument = async () => {
    await delDoc();
    navigate('/')
    setCurrentDocumentId(null)
  }

  return (
    <div
      id="header"
      className={clsx(
        'border-b h-14 max-h-14 border-rotion-600 py-[1.125rem] px-6 flex items-center gap-4 leading-tight transition-all duration-250 region-drag',
        {
          'pl-24': !isSidebarOpen && isMacOS,
          'w-full': !isSidebarOpen,
          'flex-1': isSidebarOpen,
        },
      )}
    >
      <Collapsible.Trigger
        className={clsx('h-5 w-5 text-rotion-200 hover:text-rotion-50', {
          hidden: isSidebarOpen,
          block: !isSidebarOpen,
        })}
      >
        <CaretDoubleRight className="h-4 w-4" />
      </Collapsible.Trigger>

      {id && (
        <>
          <Breadcrumbs.Root>
            <Breadcrumbs.Item>
              <Code weight="bold" className="h-4 w-4 text-pink-500" />
              Estrutura técnica
            </Breadcrumbs.Item>
            <Breadcrumbs.Separator />
            <Breadcrumbs.HiddenItems />
            <Breadcrumbs.Separator />
            <Breadcrumbs.Item>Back-end</Breadcrumbs.Item>
            <Breadcrumbs.Separator />
            <Breadcrumbs.Item isActive>{document?.name || 'Untitled'}</Breadcrumbs.Item>
          </Breadcrumbs.Root>

          <div className="inline-flex region-no-drag gap-1">
            <button
              onClick={() => forceSave()}
              disabled={isOperationDisabled}
              className="rounded p-2 bg-rotion-500 inline-flex items-center gap-1 text-rotion-100 text-sm hover:text-rotion-50 hover:bg-rotion-400 disabled:opacity-60  transition-colors duration-200"
            >
              {isSaving ? <Spinner/> : <FloppyDisk className="h-4 w-4" />}
            </button>
            <button
              onClick={() => deleteDocument()}
              disabled={isOperationDisabled}
              className="rounded p-2 bg-rotion-500 inline-flex items-center gap-1 text-rotion-100 text-sm hover:text-rotion-50 hover:bg-rotion-400 disabled:opacity-60  transition-colors duration-200"
            >
              {isDeleting ? <Spinner/> : <Trash className="h-4 w-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
