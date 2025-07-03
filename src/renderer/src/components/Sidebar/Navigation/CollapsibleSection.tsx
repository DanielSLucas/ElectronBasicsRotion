import * as Collapsible from '@radix-ui/react-collapsible'
import { CaretDown } from 'phosphor-react'
import { FEntry, FType } from '~/src/shared/types/ipc'
import { Link } from './Link'
import { useState } from 'react'
import clsx from 'clsx'

interface LinkProps {
  name: string
  content: FEntry[]
}

export function CollapsibleSection({ content, name }: LinkProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(false)

  return (
    <Collapsible.Root 
      onOpenChange={setIsSectionOpen} 
      className={clsx(
        "w-1/1 flex flex-col items-left rounded",
        {
          "bg-rotion-200/5": isSectionOpen
        }
      )}
    >
      <Collapsible.Trigger className="flex items-left justify-between text-sm gap-2 text-rotion-100 hover:text-rotion-50 py-1 px-3 rounded group hover:bg-rotion-700">
        <strong className="truncate">{name}</strong>

        <div className="flex items-center h-full group-hover:visible ml-auto text-rotion-100 px-px">
          <CaretDown weight="bold" className="h-4 w-4" />
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {
          content.map(f => f.type === FType.FOLDER
            ? (<CollapsibleSection key={f.id} name={f.name} content={f.content} />)
            : (
              <Link
                to={`/documents/${f.id}`}
                key={f.id}
              >
                {f.name.split('.')[0]}
              </Link>
              ),
          )
        }
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
