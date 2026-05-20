import { COMPANY_RATIO, TAX_RATIO } from '@/constants/money-ratio';

export const getNetAmount = (amount: number) =>
	amount * (1 - COMPANY_RATIO) * (1 - TAX_RATIO);
