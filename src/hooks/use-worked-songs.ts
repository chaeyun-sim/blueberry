import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { markAsWorked, unmarkAsWorked } from '@/api/recommendation'
import { recommendationKeys } from '@/api/recommendation/queryKeys'
import { recommendationQueries } from '@/api/recommendation/queries'
import { useAuth } from '@/hooks/use-auth'

export function useWorkedSongs() {
  const { isGuest } = useAuth()
  const queryClient = useQueryClient()

  const { data: workedSongs = new Set<string>() } = useQuery({
    ...recommendationQueries.workedIds(),
    enabled: !isGuest,
  })

  const markMutation = useMutation({
    mutationFn: markAsWorked,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recommendationKeys.workedIds() }),
  })

  const unmarkMutation = useMutation({
    mutationFn: unmarkAsWorked,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recommendationKeys.workedIds() }),
  })

  return {
    workedSongs,
    markAsWorked: (id: string) => { if (!isGuest) markMutation.mutate(id); },
    unmarkAsWorked: (id: string) => { if (!isGuest) unmarkMutation.mutate(id); },
  }
}
