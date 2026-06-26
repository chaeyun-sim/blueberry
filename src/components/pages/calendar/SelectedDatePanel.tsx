import dayjs from 'dayjs';
import { AnimatePresence,motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WEEK_KOR } from '@/constants/week';
import { StatusBadge } from '@/features/commission/components';
import { CommissionForCalendar } from '@/utils/calendar';

interface SelectedDatePanelProps {
	selectedDate: string | null;
	commissions: CommissionForCalendar[];
	onClose: () => void;
}

export function SelectedDatePanel({ selectedDate, commissions, onClose }: SelectedDatePanelProps) {
	const navigate = useNavigate();

	return (
		<AnimatePresence>
			{selectedDate && (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 8 }}
					transition={{ duration: 0.18, ease: 'easeOut' }}
					className='mt-4'
				>
					<div className='bg-card rounded-3xl border shadow-sm p-6'>
						<div className='flex items-center justify-between mb-4'>
							<div>
								<h3 className='text-xl font-display font-bold mt-0.5'>
									{dayjs(selectedDate).format('M월 D일')}
									<span className='text-base text-muted-foreground font-normal ml-2'>
										{WEEK_KOR[dayjs(selectedDate).day()]}요일 · {commissions.length}건
									</span>
								</h3>
							</div>
							<button
								onClick={onClose}
								className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
								aria-label='날짜 선택 닫기'
							>
								<X className='h-4 w-4' />
							</button>
						</div>

						{commissions.length === 0 ? (
							<p className='text-sm text-muted-foreground text-center py-6'>
								의뢰가 없습니다.
							</p>
						) : (
							<div className='space-y-2'>
								{commissions.map((c) => (
									<button
										key={c.id}
										type='button'
										onClick={() => navigate(`/commissions/${c.id}`)}
										className='w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors text-left group'
									>
										<div className='min-w-0 flex-1'>
											<p className='text-sm font-semibold truncate group-hover:text-primary transition-colors'>
												{c.songs?.title ?? c.title}
											</p>
											<p className='text-[11px] text-muted-foreground mt-0.5 truncate'>
												{[c.songs?.composer ?? c.composer, c.arrangement]
													.filter(Boolean)
													.join(' · ')}
											</p>
										</div>
										<StatusBadge status={c.status} className='shrink-0' />
									</button>
								))}
							</div>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
