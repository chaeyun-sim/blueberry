import { queryOptions, skipToken } from '@tanstack/react-query'
import { getArrangement, getSong, getSongs, getSongsSummary } from '.'
import { scoreKeys } from './queryKeys'

export const scoreQueries = {
  getSongs: () =>
    queryOptions({
      queryKey: scoreKeys.list(),
      queryFn: getSongs,
      retry: 3,
    }),
  getSongsSummary: () =>
    queryOptions({
      queryKey: scoreKeys.summary(),
      queryFn: getSongsSummary,
      retry: 3,
    }),
  getSong: (id: string) =>
    queryOptions({
      queryKey: scoreKeys.detail(id),
      queryFn: () => getSong(id),
      enabled: !!id,
      retry: 3,
    }),
  getArrangement: (arrangementId: string | undefined) =>
    queryOptions({
      queryKey: scoreKeys.arrangement(arrangementId ?? ''),
      queryFn: arrangementId ? () => getArrangement(arrangementId) : skipToken,
      retry: 3,
    }),
}
