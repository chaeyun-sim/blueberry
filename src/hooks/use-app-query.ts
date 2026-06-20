import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
  type DefaultError,
} from '@tanstack/react-query'

export function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
  } satisfies UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) as UseQueryResult<TData, TError>
}
