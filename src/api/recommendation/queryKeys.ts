export const recommendationKeys = {
  all: ['recommendations'] as const,
  today: () => [...recommendationKeys.all, 'today'] as const,
  recent: (limit: number) => [...recommendationKeys.all, 'recent', limit] as const,
  list: () => [...recommendationKeys.all, 'list'] as const,
  workedIds: () => ['worked-songs'] as const,
}
