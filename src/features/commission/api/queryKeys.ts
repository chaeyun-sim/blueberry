export const commissionKeys = {
  all: ['commissions'] as const,
  list: () => [...commissionKeys.all, 'list'] as const,
  detail: (id: string) => [...commissionKeys.all, 'detail', id] as const,
  monthlyCounts: () => [...commissionKeys.all, 'monthlyCounts'] as const,
}