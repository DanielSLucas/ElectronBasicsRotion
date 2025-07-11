import { MagnifyingGlass } from 'phosphor-react'
import { SearchBar } from '../SearchBar'
import { useState } from 'react'

export function Search() {
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false)

  function handleOpenChange(isOpen: boolean) {
    setIsSearchBarOpen(isOpen)
  }

  return (
    <>
      <button
        onClick={() => handleOpenChange(true)}
        className="flex mx-3.5 items-center justify-between text-rotion-100 text-sm hover:text-rotion-50 hover:bg-rotion-700 p-1.5 rounded"
      >
        <div className='flex items-center gap-2'>
          <MagnifyingGlass className="w-5 h-5" />
          Busca rápida
        </div>
        <span className='text-rotion-400'>ctrl+k</span>
      </button>
      <SearchBar open={isSearchBarOpen} onOpenChange={handleOpenChange} />
    </>
  )
}
