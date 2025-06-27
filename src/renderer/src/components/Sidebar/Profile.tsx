import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Folder } from 'phosphor-react'

export function Profile() {
  const queryClient = useQueryClient()

  const { data: workDir } = useQuery({
    queryKey: ['workDir'],
    queryFn: () => window.api.getWorkDir(),
  })

  const { mutateAsync: selectFolder } = useMutation({
    mutationFn: () => window.api.setWorkDir(),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['workDir'], () => data)
      }
    },
  })

  return (
    <button
      className="text-rotion-100 flex mx-5 items-center gap-2 text-sm font-medium group"
      onClick={() => selectFolder()}
    >
      <Folder className="h-5 w-5 text-rotion-300" />
      {workDir
        ? workDir.split('\\')[workDir.split('\\').length - 1]
        : 'Escolher pasta'}
    </button>
  )
}
