import * as Navigation from './Navigation'
import clsx from 'clsx'
import { CaretDoubleLeft } from 'phosphor-react'
import * as Collapsible from '@radix-ui/react-collapsible'

import { CreatePage } from './CreatePage'
import { Profile } from './Profile'
import { Search } from './Search'
import { useQuery } from '@tanstack/react-query'
import { FType } from '~/src/shared/types/ipc'
import { ChatButton } from './ChatButton'

export function Sidebar() {
  const isMacOS = process.platform === 'darwin'

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await window.api.fetchDocuments()
      return response.data
    },
  })

  return (
    <Collapsible.Content className="bg-rotion-800 flex-shrink-0 border-r border-rotion-600 h-full relative group data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out overflow-hidden">
      <Collapsible.Trigger
        className={clsx(
          'absolute h-5 w-5 right-4 text-rotion-200 hover:text-rotion-50 inline-flex items-center justify-center',
          {
            'top-[1.125rem]': isMacOS,
            'top-6': !isMacOS,
          },
        )}
      >
        <CaretDoubleLeft className="h-4 w-4" />
      </Collapsible.Trigger>

      <div
        className={clsx('region-drag h-14', {
          block: isMacOS,
          hidden: !isMacOS,
        })}
      />

      <div
        className={clsx(
          'flex-1 flex flex-col gap-8 h-full w-[240px] group-data-[state=open]:opacity-100 group-data-[state=closed]:opacity-0 transition-opacity duration-200',
          {
            'pt-6': !isMacOS,
          },
        )}
      >
        <Profile />
        <div className='flex flex-col gap-1'>
          <Search />
          <ChatButton />
        </div>

        <Navigation.Root>
          <Navigation.Section>
            <Navigation.SectionTitle>Workspace</Navigation.SectionTitle>
            <Navigation.SectionContent>
              {data?.map(f => f.type === FType.FOLDER
                ? (
                  <Navigation.CollapsibleSection
                    key={f.id}
                    name={f.name.split('.')[0]}
                    content={f.content}
                  />
                  )
                : (
                  <Navigation.Link to={`/documents/${f.id}`} key={f.id}>
                    {f.name.split('.')[0]}
                  </Navigation.Link>
                  ),
              )}
            </Navigation.SectionContent>
          </Navigation.Section>
        </Navigation.Root>

        <CreatePage />
      </div>
    </Collapsible.Content>
  )
}
