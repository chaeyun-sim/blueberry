import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import { CommissionStatus } from '@/constants/status-config';
import { EditFormType } from '@/types/form';
import { DifficultyLevelType } from '@/types/commission';

interface CommissionInfoCardProps {
	form: EditFormType;
	isSubmitting: boolean;
	onChange: (update: Partial<EditFormType>) => void;
}

export function CommissionInfoCard({ form, isSubmitting, onChange }: CommissionInfoCardProps) {
	const dateInputRef = useRef<HTMLInputElement>(null);

	return (
		<Card className='border-border/50 mb-6'>
			<CardContent className='p-5'>
				<h2 className='font-display font-semibold mb-4'>의뢰 정보</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
					<div className='space-y-2'>
						<Label>현재 상태</Label>
						<Select
							value={form.status ?? ''}
							onValueChange={(value) => onChange({ status: value as CommissionStatus })}
							disabled={isSubmitting}
							aria-label='상태 선택'
						>
							<SelectTrigger>
								<SelectValue placeholder='상태를 선택하세요' />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(COMMISSION_STATUS_TRANSLATE).map((status) => (
									<SelectItem key={status} value={status}>
										{COMMISSION_STATUS_TRANSLATE[status]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='deadline'>마감일</Label>
						<div className='relative'>
							<Input
								id='deadline'
								ref={dateInputRef}
								type='date'
								className='pr-9 [&::-webkit-calendar-picker-indicator]:hidden'
								value={form.deadline}
								onChange={(e) => onChange({ deadline: e.target.value })}
								disabled={isSubmitting}
							/>
							<button
								type='button'
								aria-label='날짜 선택'
								onClick={() => dateInputRef.current?.showPicker()}
								className='absolute right-0 top-0 bottom-0 px-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
							>
								<Calendar className='h-4 w-4' />
							</button>
						</div>
					</div>

					<div className='md:col-span-3'>
						<InstrumentPicker
							instruments={form.instruments}
							onChange={(instruments) => onChange({ instruments })}
							disabled={isSubmitting}
						/>
					</div>

					<div className='space-y-2'>
						<Label>버전</Label>
						<Select
							value={form.version ?? 'normal'}
							onValueChange={(value) =>
								onChange({ version: value === 'normal' ? null : (value as DifficultyLevelType) })
							}
							disabled={isSubmitting}
						>
							<SelectTrigger>
								<SelectValue placeholder='버전을 선택하세요' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='normal'>-</SelectItem>
								<SelectItem value='easy'>Easy</SelectItem>
								<SelectItem value='hard'>Hard</SelectItem>
								<SelectItem value='pro'>Pro</SelectItem>
							</SelectContent>
						</Select>
					</div>


					<div className='space-y-2 md:col-span-3'>
						<Label htmlFor='notes'>메모</Label>
						<Textarea
							id='notes'
							placeholder='추가 요청사항이나 메모...'
							rows={4}
							value={form.notes}
							onChange={(e) => onChange({ notes: e.target.value })}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
