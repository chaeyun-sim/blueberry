import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
  type DefaultError,
} from '@tanstack/react-query'
import { useAuth } from '@/components/AuthProvider'
import { getDemoData } from '@/data/demo'

export function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { isGuest } = useAuth()

   
  return useQuery({
    ...options,
    ...(isGuest && {
      queryFn: () => getDemoData(options.queryKey!) as TQueryFnData,
      staleTime: Infinity,
    }),
  } satisfies UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) as UseQueryResult<TData, TError>
}
