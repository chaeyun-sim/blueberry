import { queryOptions } from '@tanstack/react-query';
import { getCommission, getCommissions } from '.';
import { commissionKeys } from './queryKeys';

export const commissionQueries = {
	getCommissions: () => queryOptions({
		queryKey: commissionKeys.list(),
		queryFn: getCommissions,
	}),
	getCommission: (commissionId: string) => queryOptions({
		queryKey: commissionKeys.detail(commissionId),
		queryFn: () => getCommission(commissionId),
		enabled: !!commissionId,
	}),
}