import { CheckCircle, LucideIcon, Music2, Package2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CommissionStatus } from '@/constants/status-config';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';

const statusIcons: Record<Exclude<CommissionStatus, 'cancelled'>, LucideIcon> = {
	received: Package2,
	working: Music2,
	complete: CheckCircle,
};

interface CommissionStatusProgressProps {
	status: CommissionStatus;
	currentStatusIndex: number;
};

export const CommissionStatusProgress = ({ status, currentStatusIndex }: CommissionStatusProgressProps) => {
	if (status === 'cancelled') {
		return (
			<Card className='mb-8 border-border/50'>
				<CardContent className='p-6 flex items-center justify-center gap-2.5 text-muted-foreground'>
					<XCircle className='h-5 w-5' />
					<span className='text-sm font-medium'>취소된 의뢰입니다</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='mb-8 border-border/50'>
			<CardContent className='p-6'>
				<div className='flex items-center justify-between w-full'>
					{Object.entries(COMMISSION_STATUS_TRANSLATE).map(([status, label], i, originArray) => {
						const Icon = statusIcons[status as Exclude<CommissionStatus, 'cancelled'>];
						return (
							<div
								key={status}
								className={cn(
									'flex items-center',
									i < originArray.length - 1 ? 'flex-1' : '',
								)}
							>
								<div className='flex flex-col items-center'>
									<div
										className={cn(
											'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
											i <= currentStatusIndex
												? 'bg-primary text-primary-foreground'
												: 'border-2 border-border text-muted-foreground/40',
										)}
									>
										<Icon className={i <= currentStatusIndex ? 'h-5 w-5' : 'h-4 w-4'} />
									</div>
									<span
										className={cn(
											'text-xs mt-2',
											i <= currentStatusIndex ? 'font-medium' : 'text-muted-foreground',
										)}
									>
										{label}
									</span>
								</div>
								{i < originArray.length - 1 && (
									<div
										className={cn(
											'flex-1 h-0.5 mx-3',
											i < currentStatusIndex ? 'bg-primary' : 'bg-border',
										)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
