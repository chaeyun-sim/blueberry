export const scoreKeys = {
  all: ['scores'] as const,
  list: () => [...scoreKeys.all, 'list'] as const,
  detail: (id: string) => [...scoreKeys.all, 'detail', id] as const,
  arrangement: (id: string) => [...scoreKeys.all, 'arrangement', id] as const,
}
