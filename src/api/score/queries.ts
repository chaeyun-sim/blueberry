import { queryOptions } from '@tanstack/react-query'
import { getArrangement, getSong, getSongs } from '.'
import { scoreKeys } from './queryKeys'

export const scoreQueries = {
  getSongs: () =>
    queryOptions({
      queryKey: scoreKeys.list(),
      queryFn: getSongs,
    }),
  getSong: (id: string) =>
    queryOptions({
      queryKey: scoreKeys.detail(id),
      queryFn: () => getSong(id),
      enabled: !!id,
    }),
  getArrangement: (arrangementId: string) =>
    queryOptions({
      queryKey: scoreKeys.arrangement(arrangementId),
      queryFn: () => getArrangement(arrangementId),
      enabled: !!arrangementId,
    }),
}
