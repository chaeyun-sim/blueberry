import { queryOptions } from '@tanstack/react-query'
import { getAllRecommendations, getRecentRecommendations, getTodayRecommendation, getWorkedSongIds } from '.'
import { recommendationKeys } from './queryKeys'

export const recommendationQueries = {
  today: () =>
    queryOptions({
      queryKey: recommendationKeys.today(),
      queryFn: getTodayRecommendation,
    }),

  recent: (limit: number) =>
    queryOptions({
      queryKey: recommendationKeys.recent(limit),
      queryFn: () => getRecentRecommendations(limit),
    }),

  list: () =>
    queryOptions({
      queryKey: recommendationKeys.list(),
      queryFn: getAllRecommendations,
    }),

  workedIds: () =>
    queryOptions({
      queryKey: recommendationKeys.workedIds(),
      queryFn: getWorkedSongIds,
    }),
}
