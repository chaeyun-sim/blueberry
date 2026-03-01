import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { markAsWorked, unmarkAsWorked } from '@/api/recommendation'
import { recommendationKeys } from '@/api/recommendation/queryKeys'
import { recommendationQueries } from '@/api/recommendation/queries'

export function useWorkedSongs() {
  const queryClient = useQueryClient()

  const { data: workedSongs = new Set<string>() } = useQuery(recommendationQueries.workedIds())

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
    markAsWorked: (id: string) => markMutation.mutate(id),
    unmarkAsWorked: (id: string) => unmarkMutation.mutate(id),
  }
}
