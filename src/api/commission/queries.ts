import { queryOptions } from '@tanstack/react-query';
import { getCommission, getCommissions, getMonthlyCommissionCounts } from '.';
import { commissionKeys } from './queryKeys';

export const commissionQueries = {
  getCommissions: () => queryOptions({
    queryKey: commissionKeys.list(),
    queryFn: getCommissions,
    retry: 3,
  }),
  getCommission: (commissionId: string) => queryOptions({
    queryKey: commissionKeys.detail(commissionId),
    queryFn: () => getCommission(commissionId),
    enabled: !!commissionId,
    retry: 3,
  }),
  getMonthlyCommissionCounts: () => queryOptions({
    queryKey: commissionKeys.monthlyCounts(),
    queryFn: getMonthlyCommissionCounts,
    retry: 3,
  }),
}